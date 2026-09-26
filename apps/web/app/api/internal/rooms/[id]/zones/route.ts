import { getMapZones } from "@/services/zone.service"
import { prisma } from "@repo/db/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-internal-secret")
  const { id } = await params

  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const room = await prisma.room.findUnique({
    where: { id: id },
    include: { map: true },
  })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  const zones = await getMapZones(room.map.mapUrl)

  return NextResponse.json({ zones })
}