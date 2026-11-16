import { getSession } from "@/lib/getSession";
import { deleteRoom } from "@/services/room.service";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const session = await getSession()

        if (!session || session.isGuest) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await deleteRoom(id, session.userId)
        return NextResponse.json({ success: true }, { status: 200 })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

}