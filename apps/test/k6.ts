import ws from 'k6/ws';
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';
import { sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const WS_URL = __ENV.WS_URL;
const SECRET = __ENV.JWT_SECRET;
const USERS = Number(__ENV.USERS);
const PER_ROOM = Number(__ENV.PER_ROOM ?? 20);

const SPEED = 150;
const SEND_HZ = 15;
const SPAWN = { x: 200, y: 300 };
const ZONE = { minX: 705, maxX: 1023, minY: 449, maxY: 640 };
const HANGOUT = { x: 400, y: 300 };
// -----------------------------

const msgsIn = new Counter('msgs_in');
const callStarts = new Counter('call_starts');
const callEnds = new Counter('call_ends');
const unexpectedClose = new Counter('ws_unexpected_close');
const joinedOk = new Rate('joined_ok');

export const options = {
  scenarios: {
    players: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: USERS },
        { duration: '2m', target: USERS },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    joined_ok: ['rate>0.99'],
    ws_unexpected_close: ['count==0'],
    ws_connecting: ['p(95)<1000'],
  },
};

function signTicket(claims: object) {
  const b64 = (o: object) => encoding.b64encode(JSON.stringify(o), 'rawurl');
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64({ ...claims, exp: Math.floor(Date.now() / 1000) + 30 });
  const sig = crypto.hmac('sha256', SECRET, `${head}.${body}`, 'base64rawurl');
  return `${head}.${body}.${sig}`;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));

function pickTarget() {
  const r = Math.random();
  if (r < 0.35) return { x: rand(ZONE.minX + 20, ZONE.maxX - 20), y: rand(ZONE.minY + 20, ZONE.maxY - 20) };
  if (r < 0.65) return { x: HANGOUT.x + rand(-40, 40), y: HANGOUT.y + rand(-40, 40) };
  return { x: rand(100, 1000), y: rand(100, 600) };
}

function send(socket: any, x: number, y: number, direction: string, moving: boolean) {
  socket.send(JSON.stringify({ op: 2, d: { x, y, direction, moving } }));
}

export default function () {
  const idx = __VU - 1;
  const roomId = `load-room-${Math.floor(idx / PER_ROOM)}`;

  const ticket = signTicket({
    userId: `load-${__VU}`,
    username: `load${__VU}`,
    roomId,
    jti: `${__VU}-${__ITER}-${Date.now()}`, // unique per connection
  });

  let x = SPAWN.x, y = SPAWN.y;
  let target: { x: number; y: number } | null = null;
  let idleTicks = 0;
  let weClosed = false;
  let gotRoom = false;
  const step = SPEED / SEND_HZ;

  ws.connect(`${WS_URL}/ws?roomId=${roomId}&ticket=${ticket}`, {}, (socket) => {
    socket.on('message', (raw: string) => {
      msgsIn.add(1);
      const m = JSON.parse(raw);
      if (m.op === 4 && !gotRoom) { gotRoom = true; joinedOk.add(true); }
      else if (m.op === 7) callStarts.add(1);
      else if (m.op === 8) callEnds.add(1);
    });

    socket.setInterval(() => {
      if (idleTicks > 0) { idleTicks--; return; }
      if (!target) target = pickTarget();
      const dx = target.x - x, dy = target.y - y;
      const dist = Math.hypot(dx, dy);
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');

      if (dist <= step) {
        x = target.x; y = target.y; target = null;
        idleTicks = randInt(3, 10) * SEND_HZ;
        send(socket, x, y, dir, false);
        return;
      }
      x += (dx / dist) * step;
      y += (dy / dist) * step;
      send(socket, x, y, dir, true);
    }, 1000 / SEND_HZ);

    socket.setTimeout(() => { weClosed = true; socket.close(); }, randInt(120, 300) * 1000);
    socket.on('close', () => { if (!weClosed) unexpectedClose.add(1); });
    socket.on('error', (e: any) => console.error('WS error', e.error()));
  });

  if (!gotRoom) joinedOk.add(false);
  sleep(randInt(3, 8));
}