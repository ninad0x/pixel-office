import { prisma } from "@repo/db/client"
import { Prisma } from "../../../packages/db/generated/prisma"

export type RoomWithDetails = Prisma.RoomGetPayload<{
    include: {
        map: true,
        creator: { select: { username: true } }
    }
}>

export async function getRooms(userId: string): Promise<RoomWithDetails[]> {
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