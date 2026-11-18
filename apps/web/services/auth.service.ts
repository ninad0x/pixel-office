import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db/client"

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

function sign(user: { id: string; username: string }) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return jwt.sign({ userId: user.id, username: user.username }, secret, {
    algorithm: "HS256",
    expiresIn: "7d",
  })
}

export async function register(username: string, password: string) {
  try {
    const user = await prisma.user.create({
      data: { username, password: await bcrypt.hash(password, 10) },
    })
    return sign(user)
  } catch (e: any) {
    if (e.code === "P2002") throw new AuthError("Username already taken", 409)
    throw e
  }
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthError("Invalid username or password", 401)
  }
  return sign(user)
}