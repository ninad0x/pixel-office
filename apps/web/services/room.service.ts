import { prisma } from "@repo/db/client"
import type { Prisma } from "../../../packages/db/generated/prisma"

// mannual custom type approach
// export type RoomWithDetails = Prisma.RoomGetPayload<{
//     include: {
//         map: true,
//         creator: { select: { username: true } }
//     }
// }>

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


export async function createRoom(roomName: string, mapId: string, userId: string) {
    return await prisma.room.create({
        data: {
            name: roomName, mapId, createdBy: userId
        }
    })
}


export async function deleteRoom(roomId: string, userId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId }})

    if (!room) throw new Error("Room does not Exist!")
    if (room.createdBy !== userId) throw new Error("Unauthorized")

    await prisma.room.delete({ where: { id: roomId }})
}