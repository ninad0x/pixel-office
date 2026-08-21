import { prisma } from "../index";
import bcrypt from "bcryptjs";

// creates a tets user and a map
// map resources are in public folder, if changed rename accordingly

async function main() {
  const hashedPassword = await bcrypt.hash("test1234", 10);

  const user = await prisma.user.upsert({
    where: { username: "testuser" },
    update: {},
    create: {
      username: "testuser",
      password: hashedPassword,
    },
  });

  const map = await prisma.map.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Default Map",
      mapUrl: "/default_map_1.tmj",
      createdBy: user.id,
    },
  });

  const room = await prisma.room.upsert({
    where: { name_createdBy: { name: "test-room", createdBy: user.id } },
    update: {},
    create: {
      name: "test-room",
      mapId: map.id,
      createdBy: user.id,
    },
  });

  console.log("\nSeeded user:", user.username, "(password: test1234)");
  console.log("Room ID:", room.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());