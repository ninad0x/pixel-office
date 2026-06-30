import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db/client"

const JWT_SECRET = process.env.JWT_SECRET!


export async function register(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) throw new Error("Username already taken")
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, password: hashed }
  })

  const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: "7d" })
  return token
}


export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) throw new Error("Invalid credentials")

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error("Invalid credentials")

  const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: "7d" })
  return token
}