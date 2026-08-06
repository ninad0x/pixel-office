"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { socket } from "@/lib/ws/ws-manager";
import { RoomWithMap,RoomWithDetails } from "@/services/room.service";

type PlayProps = {
  userId: string;
  room: RoomWithMap;
};

export default function PlayClient({ userId, room }: PlayProps) {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: Phaser.Game | null = null;
    
    (async () => {
      useGameStore.getState().setId(userId);
      useGameStore.getState().setRoom(room.id);      
      // useGameStore.getState().setMap(room.map.metadata)


      socket.connect(room.id);

      const Phaser = await import("phaser");
      const { PlayScene } = await import("./PlayScene");

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: phaserRef.current!,
        physics: { default: "arcade" },
        scene: [PlayScene],
        pixelArt: true,
        backgroundColor: "#1e1e1e",
      });
    })();

    return () => {
        game?.destroy(true);
        socket.disconnect();
    };

  }, [userId, room.id]);

  return <div ref={phaserRef} className="w-full h-screen" />;
}