import { useEffect, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { Track, RemoteTrackPublication } from "livekit-client";
import { useCallStore } from "@/store/callstore";

export const ProximityManager = () => {
	
  const room = useRoomContext();
  const participants = useCallStore((s) => s.participants);
  const prevParticipants = useRef<string[]>([]);

  useEffect(() => {
    const prev = prevParticipants.current;

    const added = participants.filter((id) => !prev.includes(id));
    const removed = prev.filter((id) => !participants.includes(id));

    const setSubscription = (identity: string, subscribed: boolean) => {
      const participant = room.getParticipantByIdentity(identity);
      if (!participant) return;

      participant.trackPublications.forEach((pub) => {
        if (
          pub.source === Track.Source.Camera ||
          pub.source === Track.Source.Microphone
        ) {
          (pub as RemoteTrackPublication).setSubscribed(subscribed);
        }
      });
    };

    added.forEach((id) => setSubscription(id, true));
    removed.forEach((id) => setSubscription(id, false));

    prevParticipants.current = participants;
  }, [participants, room]);

  return null;
};