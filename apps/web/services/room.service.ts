import { prisma } from "@repo/db/client"
import type { Prisma } from "../../../packages/db/generated/prisma"
import { getMapZones } from "./zone.service";
import { randomUUID } from "node:crypto";

// mannual custom type approach
// export type RoomWithDetails = Prisma.RoomGetPayload<{
//     include: {
//         map: true,
//         creator: { select: { username: true } }
//     }
// }>

export async function canJoinRoom(
    userId: string, 
    room: Pick<RoomWithMap, "id" | "isPublic" | "createdBy">
): Promise<boolean> {
    
    if (room.isPublic || room.createdBy === userId) return true

    const member = await prisma.roomPlayer.findUnique({
        where: { roomId_userId: { roomId: room.id, userId } },
        select: { userId: true }
    })

    return member !== null
}

export async function getRooms(userId: string) {
    // get rooms that user - created or joined
    return prisma.room.findMany({
        where: {
            OR: [
                { createdBy: userId },
                { players: { some: { userId } } }
            ]
        },
        include: { map: true, creator: { select: { username: true } } }
    })
}
export type RoomWithDetails = Awaited<ReturnType<typeof getRooms>>[number];


export async function getRoomById(roomId: string) {
    return prisma.room.findUnique({
        where: { id: roomId },
        include: { map: true }
    })
}
export type RoomWithMap = NonNullable<Awaited<ReturnType<typeof getRoomById>>>


export async function createRoom(roomName: string, mapId: string, userId: string, isPublic: boolean) {
    const shareCode = randomUUID()

    return prisma.room.create({
        data: { name: roomName, mapId, createdBy: userId, shareCode, isPublic },
    })
}


export async function deleteRoom(roomId: string, userId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId }})

    if (!room) throw new Error("Room does not Exist!")
    if (room.createdBy !== userId) throw new Error("Unauthorized")

    await prisma.room.delete({ where: { id: roomId }})
}


export async function joinRoomByCode(shareCode: string, userId: string) {
    const room = await prisma.room.findUnique({
        where: { shareCode },
        select: { id: true },
    })
    if (!room) return null

    await prisma.roomPlayer.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: {},
        create: { roomId: room.id, userId },
    })
    
    return room.id
}


export async function regenerateShareCode(roomId: string, userId: string) {
    const { count } = await prisma.room.updateMany({
        where: { id: roomId, createdBy: userId },
        data: { shareCode: randomUUID() },
    })
    return count === 1
}

export async function setVisibility(roomId: string, userId: string, isPublic: boolean) {
    const { count } = await prisma.room.updateMany({
        where: { id: roomId, createdBy: userId },
        data: { isPublic },
    })
    return count === 1
}

export async function leaveRoom(roomId: string, userId: string) {
    const { count } = await prisma.roomPlayer.deleteMany({
        where: { roomId, userId, room: { createdBy: { not: userId } } },
    })
    return count === 1
}