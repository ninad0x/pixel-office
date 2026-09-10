import { useCallStore } from '@/store/callstore';
import { CarouselLayout, ParticipantTile, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import React from 'react'

export const CallTiles = () => {
  const participants = useCallStore((s) => s.participants);
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (participants.length === 0) return null;
  

  return (
    <div>
      <CarouselLayout className="w-full flex gap-1" tracks={tracks}>
        <ParticipantTile className="w-60 rounded-4xl overflow-hidden" />
      </CarouselLayout>
    </div>
  );
};
