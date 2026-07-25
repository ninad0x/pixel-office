import z from "zod"

export const RoomSchema = z.object({
    name: z.string(),
    mapId: z.string()
})