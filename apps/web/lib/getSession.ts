import "server-only"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db/client";

export type Session = { userId: string; isGuest: boolean }

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get("auth-token")?.value
  if (!token) return null

  let payload: { userId: string; isGuest?: boolean }
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")


  try {
    payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as typeof payload
  } catch {
    return null
  }

  if (payload.isGuest) return { userId: payload.userId, isGuest: true }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  })

  return user ? { userId: user.id, isGuest: false } : null
}