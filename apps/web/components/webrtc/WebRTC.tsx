import { LiveKitRoom } from "@livekit/components-react"
import { AudioRender } from "./AudioRender"
import { CallTiles } from "./CallTiles"
import { MediaControls } from "./MediaControls"

console.log("webrtc rendered");

export const WebRTC = ({ token }: {token: string}) => {
    console.log("token", token);
    console.log("livekit server URL", process.env.NEXT_PUBLIC_LIVEKIT_URL);

    return <LiveKitRoom 
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        connect={true}
        audio={true}
        // connectOptions={{ autoSubscribe: false }}
        video={true}
        
    >
        <CallTiles />
        <AudioRender />
        {/* <MediaControls /> */}

    </LiveKitRoom>
}