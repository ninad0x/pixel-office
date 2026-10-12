import { prisma } from "../index";
import bcrypt from "bcryptjs";

const ROOM_CAPACITY = 25;

async function main() {
  const start = performance.now();

  const count = Number(process.argv[2] ?? 10);

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("User count must be a positive integer");
  }

  const hashedPassword = await bcrypt.hash("test1234", 10);

  const users = [];

  for (let i = 1; i <= count; i++) {
    const user = await prisma.user.upsert({
      where: { username: `testuser${i}` },
      update: {},
      create: {
        username: `testuser${i}`,
        password: hashedPassword,
        avatarUrl: "default",
      },
    });

    users.push(user);
  }

  const map = await prisma.map.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Default Map",
      mapUrl: "/default map 1.tmj",
      createdBy: users[0]!.id,
    },
  });

  const roomCount = Math.ceil(count / ROOM_CAPACITY);
  const rooms = [];

  for (let r = 0; r < roomCount; r++) {
    const room = await prisma.room.upsert({
      where: {
        name_createdBy: {
          name: `test-room-${r}`,
          createdBy: users[0]!.id,
        },
      },
      update: {},
      create: {
        name: `test-room-${r}`,
        mapId: map.id,
        createdBy: users[0]!.id,
        maxPlayers: 25
      },
    });
    rooms.push(room);
  }

  for (let i = 0; i < users.length; i++) {
    const roomIndex = Math.floor(i / ROOM_CAPACITY);
    const room = rooms[roomIndex]!;
    const user = users[i]!;

    await prisma.roomPlayer.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      update: {},
      create: {
        roomId: room.id,
        userId: user.id,
        x: 100,
        y: 100,
      },
    });
  }

  console.log(`Seeded ${count} users across ${roomCount} room(s)`);
  rooms.forEach((r, i) => console.log(`Room ${i}: ${r.id}`));
  console.log(`Seeding took ${(performance.now() - start).toFixed(2)}ms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());