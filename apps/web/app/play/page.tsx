"use client";
import { useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";

export default function Play() {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const mapJson = await fetch("/map.json").then(r => r.json());
      useGameStore.getState().setMap(mapJson);

      const Phaser = await import("phaser");
      const { PlayScene } = await import("./PlayScene");

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: phaserRef.current!,
        scene: [PlayScene],
        pixelArt: true,
        backgroundColor: "#1e1e1e",
      });

      return () => game.destroy(true);
    })();
  }, []);

  return <div ref={phaserRef} style={{ width: "100%", height: "100%" }} />;
}
