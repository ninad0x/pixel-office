import { NextRequest, NextResponse } from "next/server"
import { login } from "@/services/auth.service"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    const token = await login(username, password)

    const res = NextResponse.json({ success: true }, { status: 201 })
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7
    })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}