import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db/client"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
  try {
    const roomId = req.nextUrl.searchParams.get("roomId")
    const cookie = req.cookies.get("auth-token")?.value
    
    if (!roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 })
    if (!cookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const decoded = jwt.verify(cookie, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ticket = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        avatar: user.avatarUrl,
        roomId,
        jti: crypto.randomUUID(),
      },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "30s" }
    )

    return NextResponse.json({ ticket })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}