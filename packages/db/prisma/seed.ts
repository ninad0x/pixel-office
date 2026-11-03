import { prisma } from "../index";
import bcrypt from "bcryptjs";

const ROOM_CAPACITY = 25;

async function main() {
  const start = performance.now();

  const count = Number(process.argv[2] ?? 100);

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("User count must be a positive integer");
  }

  const hashedPassword = await bcrypt.hash("test1234", 10);

  const usernames = Array.from(
    { length: count },
    (_, i) => `testuser${i + 1}`
  );

  await prisma.user.createMany({
    data: usernames.map(username => ({
      username,
      password: hashedPassword,
      avatarUrl: "default",
    })),
    skipDuplicates: true,
  });

  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
  });

  users.sort(
    (a, b) =>
      Number(a.username.slice(8)) - Number(b.username.slice(8))
  );

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
  const rooms = <any>[];

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

  await prisma.roomPlayer.createMany({
    data: users.map((user, i) => ({
      roomId: rooms[Math.floor(i / ROOM_CAPACITY)]!.id,
      userId: user.id,
      x: 100,
      y: 100,
    })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${count} users across ${roomCount} room(s)`);
  rooms.forEach((r: any, i: any) => console.log(`Room ${i}: ${r.id}`));
  console.log(`Seeding took ${((performance.now() - start) / 1000).toFixed(2)}s`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect());