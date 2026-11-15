import z from "zod";

const username = z.string().trim().toLowerCase()

export const RegisterSchema = z.object({
  username: username.regex(/^[a-z0-9_]{3,20}$/),
  password: z.string().min(8).max(40),
})

export const LoginSchema = z.object({
  username,
  password: z.string().min(1).max(40),
})