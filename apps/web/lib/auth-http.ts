import { NextResponse } from "next/server"
import { AuthError } from "@/services/auth.service"

export function sessionResponse(token: string) {
	const res = NextResponse.json({ success: true })
	res.cookies.set("auth-token", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	})

	return res
}

export function authErrorResponse(err: unknown) {
	if (err instanceof AuthError) {
		return NextResponse.json({ error: err.message }, { status: err.status })
	}
	console.error(err)
	
	return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
}