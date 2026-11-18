import { NextRequest, NextResponse } from "next/server"
import { login } from "@/services/auth.service"
import { LoginSchema } from "@/lib/schema/auth"
import { sessionResponse, authErrorResponse } from "@/lib/auth-http"

export async function POST(req: NextRequest) {
  try {
    const parsed = LoginSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const token = await login(parsed.data.username, parsed.data.password)
    return sessionResponse(token)
  } catch (err) {
    return authErrorResponse(err)
  }
}