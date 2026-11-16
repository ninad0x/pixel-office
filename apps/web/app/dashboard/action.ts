"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/getSession"
import { regenerateShareCode, setVisibility, leaveRoom } from "@/services/room.service"

async function requireUser() {
    const session = await getSession()
    if (!session || session.isGuest) throw new Error("Unauthorized")
    return session.userId
}

export async function regenerateShareCodeAction(roomId: string) {
    const userId = await requireUser()
    if (!(await regenerateShareCode(roomId, userId))) throw new Error("Forbidden")
    revalidatePath("/dashboard")
}

export async function setVisibilityAction(roomId: string, isPublic: boolean) {
    const userId = await requireUser()
    if (typeof isPublic !== "boolean") throw new Error("Bad request")
    if (!(await setVisibility(roomId, userId, isPublic))) throw new Error("Forbidden")
    revalidatePath("/dashboard")
}

export async function leaveRoomAction(roomId: string) {
    const userId = await requireUser()
    if (!(await leaveRoom(roomId, userId))) throw new Error("Forbidden")
    revalidatePath("/dashboard")
}