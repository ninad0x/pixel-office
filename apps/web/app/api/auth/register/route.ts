import { NextRequest, NextResponse } from "next/server"
import { register } from "@/services/auth.service"
import { RegisterSchema } from "@/lib/schema/auth"
import { sessionResponse, authErrorResponse } from "@/lib/auth-http"

export async function POST(req: NextRequest) {
  try {
    const parsed = RegisterSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    
    const token = await register(parsed.data.username, parsed.data.password)
    return sessionResponse(token)

  } catch (err) {
    return authErrorResponse(err)
  }
}