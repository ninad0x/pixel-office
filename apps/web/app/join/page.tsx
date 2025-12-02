"use client";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/gameStore";

export default function Join() {

  const gameStore = useGameStore();
  const router = useRouter();
  
  const handleJoin = () => {
    if (!gameStore.myId || !gameStore.room) return
    console.log(gameStore.myId, gameStore.room);
    router.push("/play");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-emerald-500 rounded-2xl p-4 text-white flex flex-col gap-4">
        <input className="text-black p-2 rounded" placeholder="Player ID" value={gameStore.myId} onChange={e => gameStore.setId(e.target.value)} />
        <input className="text-black p-2 rounded" placeholder="Room" value={gameStore.room} onChange={e => gameStore.setRoom(e.target.value)} />
        <button onClick={handleJoin} className="bg-black p-2 rounded">Join</button>
      </div>
    </div>
  );
}
