import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import PlayClient from "./PlayClient";
import { getRoomById } from "@/services/room.service";

export default async function PlayPage({ params }: { params: { roomId: string } }) {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch {
    redirect("/login");
  }

  const room = await getRoomById(params.roomId)
  if (!room) redirect("/join")

  return <PlayClient userId={userId} room={room}/>;
}