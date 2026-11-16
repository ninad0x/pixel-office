import { NextRequest, NextResponse } from "next/server"
import { getRooms, createRoom } from "@/services/room.service"
import { getSession } from "@/lib/getSession"
import { RoomSchema } from "@/lib/schema/room"

export async function GET(): Promise<NextResponse> {
    const session = await getSession()

    if (!session || session.isGuest) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await getRooms(session.userId)
    return NextResponse.json(rooms)
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session || session.isGuest) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: unknown

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const result = RoomSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json(
            { error: result.error.flatten() },
            { status: 400 }
        )
    }

    try {
        const room = await createRoom(
            result.data.name,
            result.data.mapId,
            session.userId,
            true
        )

        return NextResponse.json(room, { status: 201 })
    } catch {
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        )
    }
}