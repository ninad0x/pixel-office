import { create } from "zustand";
import { GameStore } from "../common/types";


export const useGameStore = create<GameStore>((set, get) => ({

    map: null,
    players: {},
    myId: null,

    setMap: (data) => {
        set({ map: data });

        const myId = get().myId;
        if (myId) {
            set((s) => {
                const me = s.players[myId] ?? null;
                if (!me) return {};
                return {
                    players: {
                        ...s.players,
                        [myId]: {
                            ...me,
                            x: data.spawn.x,
                            y: data.spawn.y,
                        },
                    },
                };
            });
        }
    },
    resetMap: () => set({ map: null }),


    setMyId: (id) => set({ myId: id }),

    updatePlayer: (data) =>
        set((s) => ({
            players: {
                ...s.players,
                [data.id]: data,
            },
        })),

    removePlayer: (id) =>
        set((s) => {
            const copy = { ...s.players };
            delete copy[id];
            return { players: copy };
        }),

    clearPlayers: () => set({ players: {} }),
}));
