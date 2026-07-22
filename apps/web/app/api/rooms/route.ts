import { NextRequest, NextResponse } from "next/server"
import { getRooms, createRoom } from "@/services/room.service"
import { getUser } from "@/lib/get-user"
import { RoomSchema } from "@/lib/schema/room.schema"


export async function GET(req: NextRequest): Promise<NextResponse> {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const rooms = await getRooms(user.userId)
    return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
    try {
        const user = getUser(req)
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
        const { name, mapId } = await req.json()
    
        const { success, data, error } = RoomSchema.safeParse({name, mapId})
    
        if (!success) {
            return NextResponse.json(
            { success: false, error: error.flatten() },
            { status: 400 }
        )}
    
        const room = await createRoom(data.name, data.mapId, user.userId)
        return NextResponse.json(room, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 })

    }
}