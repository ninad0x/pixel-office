"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { socket } from "@/lib/ws/ws-manager";
import { RoomWithMap } from "@/services/room.service";

type PlayProps = {
  userId: string;
  room: RoomWithMap;
};

export default function PlayClient({ userId, room }: PlayProps) {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: Phaser.Game | null = null;
    let cancelled = false;
    
    (async () => {
      useGameStore.getState().setId(userId);
      useGameStore.getState().setRoom(room.id);
      
      const Phaser = await import("phaser");
      const { PlayScene } = await import("./PlayScene");

      if (cancelled) return;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: phaserRef.current!,
        physics: { default: "arcade" },
        scene: [PlayScene],
        pixelArt: true,
        backgroundColor: "#1e1e1e",
        audio: { noAudio: true }
      });
    })();

    return () => {
      cancelled = true
      game?.destroy(true);
      socket.disconnect();
    };

  }, [userId, room.id]);

  return <div ref={phaserRef} className="w-full h-screen" />;
}