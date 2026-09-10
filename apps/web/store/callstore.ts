import { CallStore } from "@/types/store";
import { create } from "zustand";

export const useCallStore = create<CallStore>((set) => ({
  activeZoneId: null,
  participants: [],
  connected: false,

  joinCall: (zoneId) => set({ activeZoneId: zoneId, connected: true }),

  leaveCall: () => set({ activeZoneId: null, connected: false, participants: [] }),

  addParticipant: (id) => set((s) => 
    s.participants.includes(id) ? s : { participants: [...s.participants, id] }
  ),
  
  removeParticipant: (id) => 
    set((s) => ({participants: s.participants.filter((p) => p !== id) })),
}));