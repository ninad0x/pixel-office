import { getUser } from "@/lib/get-user";
import { deleteRoom } from "@/services/room.service";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params
        const user = getUser(req)
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
        await deleteRoom(id, user.userId)
        return NextResponse.json({ success: true }, { status: 200 })
        
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 })
    }
    
}