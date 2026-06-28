/*
  Warnings:

  - A unique constraint covering the columns `[name,createdBy]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "createdBy" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RoomPlayer" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_createdBy_key" ON "Room"("name", "createdBy");

-- CreateIndex
CREATE INDEX "RoomChat_roomId_idx" ON "RoomChat"("roomId");

-- CreateIndex
CREATE INDEX "RoomPlayer_roomId_idx" ON "RoomPlayer"("roomId");

-- AddForeignKey
ALTER TABLE "Map" ADD CONSTRAINT "Map_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
