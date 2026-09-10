import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, RemoteTrackPublication } from "livekit-client";
import { useCallStore } from "@/store/callstore";

export const ProximityManager = () => {
  const room = useRoomContext();
  const participants = useCallStore((s) => s.participants);

  useEffect(() => {
    const sync = () => {
      room.remoteParticipants.forEach((p) => {
        const inRange = participants.includes(p.identity);
        p.trackPublications.forEach((pub) => {
          if (pub.isSubscribed !== inRange) {
            console.log('checking', p.identity, 'inRange:', inRange, 'currently subscribed:', pub.isSubscribed);
            (pub as RemoteTrackPublication).setSubscribed(inRange);

          }
        });
      });
    };

    sync();

    room.on(RoomEvent.TrackPublished, sync);
    return () => {
      room.off(RoomEvent.TrackPublished, sync);
    };
  }, [participants, room]);

  return null;
};