"use client";

import { useEffect, useRef } from "react";
import { LeftPanel } from "../../components/editor/LeftPanel";
import { RightPanel } from "../../components/editor/RightPanel";

export default function Editor() {

  const phaserRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    (async () => {
        const Phaser = await import("phaser");
        const { EditorScene } = await import("./editorScene");

        const game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: phaserRef.current,
        backgroundColor: "",
        pixelArt: true,
        scene: [EditorScene],
        });

        return () => game.destroy(true);
    })();
    }, []);


  return <div className="flex w-full h-screen">
    <LeftPanel/>
    <div ref={phaserRef}/>;
    <RightPanel />
  </div>
  
}
