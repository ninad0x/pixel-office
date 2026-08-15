/*
  Warnings:

  - You are about to drop the `RoomObject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoomObject" DROP CONSTRAINT "RoomObject_roomId_fkey";

-- DropTable
DROP TABLE "RoomObject";
