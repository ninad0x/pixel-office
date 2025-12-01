"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../../common/socket"

export default function Join() {
  const [id, setId] = useState("");
  const [room, setRoom] = useState("");
  const router = useRouter();
  
  const handleJoin = () => {
    if (!id || !room) return
    socket.emit("join", { id, room });
    router.push("/play");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-emerald-500 rounded-2xl p-4 text-white flex flex-col gap-4">
        <input className="text-black p-2 rounded" placeholder="Player ID" value={id} onChange={e => setId(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Room" value={room} onChange={e => setRoom(e.target.value)} />
        <button onClick={handleJoin} className="bg-black p-2 rounded">Join</button>
      </div>
    </div>
  );
}
