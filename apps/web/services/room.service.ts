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


export async function createRoom(name: string, mapId: string, userId: string) {
    return await prisma.room.create({
        data: {
            name, mapId, createdBy: userId
        }
    })
}