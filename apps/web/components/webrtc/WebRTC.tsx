import { ControlBar, LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { CallTiles } from "./CallTiles";
import { ProximityManager } from "./ProximityManager ";
import { VideoPresets } from "livekit-client";

export const WebRTC = ({ token }: { token: string }) => {
  return (
    <LiveKitRoom 
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
      connect={true}
      audio={true}
      connectOptions={{ autoSubscribe: false }}
      video={true}
      options={{
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution
        }
      }}
    >
      {/* Headless Logic Components */}
      <ProximityManager />
      <RoomAudioRenderer />

      {/* Floating Camera Tiles Container (Top Left) */}
      <div className="fixed top-4 left-4 z-20 pointer-events-auto">
        <CallTiles />
      </div>

      {/* Floating Control Bar Dock (Bottom Center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg shadow-xl">
        <ControlBar variation="minimal" controls={{ leave: false }} />
      </div>
    </LiveKitRoom>
  );
};