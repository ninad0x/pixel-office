import { NextRequest, NextResponse } from "next/server"
import { login } from "@/services/auth.service"
import { LoginSchema } from "@/lib/schema/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {

  const user = cookies()
  try {
    console.log("data receieved");
    const { username, password } = await req.json()
    const { success, data, error } = LoginSchema.safeParse({ username, password })

    if (!success) {
      return NextResponse.json(
        { success: false, error: error.flatten() },
        { status: 400 }
      )
    }

    const token = await login(data.username, data.password)

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