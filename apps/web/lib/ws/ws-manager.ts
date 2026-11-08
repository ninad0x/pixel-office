import { ClientPayloadMap, ServerMessage, ServerPayloadMap } from "@/types/protocol";
import { fetchTicket } from "./fetch-ticket";

class WSManager {
  private conn: WebSocket | null = null;
  private roomId: string | null = null;
  private listeners: Map<number, Set<(data: any) => void>> = new Map();
  private messageQueue: string[] = [];
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private gen = 0; // bumps on connect/disconnect to cancel old async work
  private static MAX_ATTEMPTS = 6;

  private handleMessage = (message: ServerMessage) => {
    const callbacks = this.listeners.get(message.op);
    callbacks?.forEach((cb) => cb(message.d));
  };

  private fail = () => {
    this.shouldReconnect = false;
    window.location.href = "/dashboard?error=join_failed";
  };

  private reconnect = () => {
    if (!this.roomId || !this.shouldReconnect) return;
    if (this.reconnectAttempts >= WSManager.MAX_ATTEMPTS) return this.fail();
    const delay =
      Math.min(1000 * 2 ** this.reconnectAttempts, 15000) + Math.random() * 1000;
    this.reconnectAttempts++;
    this.timer = setTimeout(this.open, delay);
  };

  connect = (roomId: string) => {
    this.disconnect(); // cancel anything old
    this.roomId = roomId;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.open();
  };

  private open = async () => {
    const gen = this.gen;
    const t = await fetchTicket(this.roomId!);
    if (gen !== this.gen) return; // cancelled while fetching

    if (!t.ok) {
      if (t.unauthorized) {
        this.shouldReconnect = false;
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      return t.retry ? this.reconnect() : this.fail();
    }

    const conn = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws?roomId=${this.roomId}&ticket=${t.ticket}`
    );
    this.conn = conn;

    conn.onopen = () => {
      this.reconnectAttempts = 0;
      this.messageQueue.forEach((m) => conn.send(m));
      this.messageQueue = [];
    };

    conn.onmessage = (event) => {
      try {
        this.handleMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("Failed to parse WS message, ", e);
      }
    };

    conn.onclose = (event) => {
      if (this.conn !== conn) return; // old socket, ignore
      this.messageQueue = []; // drop stale moves
      if (event.code === 4001) {
        console.warn("Connected elsewhere — not reconnecting");
        this.shouldReconnect = false;
        return;
      }
      this.reconnect();
    };

    conn.onerror = (err) => console.error("WS error", err);
  };

  send = <T extends keyof ClientPayloadMap>(op: T, d: ClientPayloadMap[T]) => {
    const message = JSON.stringify({ op, d });
    if (this.conn?.readyState === WebSocket.OPEN) {
      this.conn.send(message);
    } else {
      this.messageQueue.push(message);
    }
  };

  disconnect = () => {
    this.shouldReconnect = false;
    this.gen++;
    
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;

    this.messageQueue = []

    this.conn?.close();
    this.conn = null;
  };

  on = <T extends keyof ServerPayloadMap>(
    op: T,
    callback: (data: ServerPayloadMap[T]) => void
  ) => {
    if (!this.listeners.has(op)) this.listeners.set(op, new Set());
    this.listeners.get(op)!.add(callback);
  };

  off = <T extends keyof ServerPayloadMap>(
    op: T,
    callback: (data: ServerPayloadMap[T]) => void
  ) => {
    this.listeners.get(op)?.delete(callback);
  };
}

export const socket = new WSManager();