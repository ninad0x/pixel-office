
export interface CallStore {
  activeZoneId: string | null;
  participants: string[];
  connected: boolean;

  joinCall: (zoneId: string) => void;
  leaveCall: () => void;
  addParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
}