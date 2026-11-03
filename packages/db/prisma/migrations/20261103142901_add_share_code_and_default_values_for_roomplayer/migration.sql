/*
  Warnings:

  - A unique constraint covering the columns `[shareCode]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shareCode` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "shareCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomPlayer" ALTER COLUMN "x" SET DEFAULT 0,
ALTER COLUMN "y" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatarUrl" SET DEFAULT 'light_male_pkmn_black';

-- CreateIndex
CREATE UNIQUE INDEX "Room_shareCode_key" ON "Room"("shareCode");

-- CreateIndex
CREATE INDEX "RoomPlayer_userId_idx" ON "RoomPlayer"("userId");
