import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function getUser(req: NextRequest) {
    const token = req.cookies.get("auth-token")?.value
    if (!token) return null
    
    try {
        return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    } catch { return null }
}