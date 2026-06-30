import z from "zod";

export const AuthSchema = z.object({
    username: z.string(),
    password: z.string().min(8)
})