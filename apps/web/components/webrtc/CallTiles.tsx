import { useCallStore } from '@/store/callstore';
import { CarouselLayout, ParticipantTile, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import React from 'react'

export const CallTiles = () => {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);
  const participants = useCallStore((s) => s.participants);

  const filteredTracks = tracks.filter((t) =>
    participants.includes(t.participant.identity)
  );

  console.log('tracks:', tracks.map(t => t.participant.identity));
  console.log('participants:', participants);


  return (
    <div>
      <CarouselLayout className='max-h-[200px] bg-green-300' tracks={filteredTracks}>
        <ParticipantTile className='size-50 max-w-[300px] max-h-[300px] bg-red-500' />
      </CarouselLayout>
    </div>
  );
};
