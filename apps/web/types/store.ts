import { GameMap } from "./map";
import { PlayerState } from "./player";

export interface GameStore {
  map: GameMap | null;
  players: Record<string, PlayerState>;
  myId: string;
  room: string;
  
  // actions
  setMap: (data: GameMap) => void;
  resetMap: () => void;
  setId: (id: string) => void;
  updatePlayer: (data: PlayerState) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
  setRoom: (room: string) => void;
}