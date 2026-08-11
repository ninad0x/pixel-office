import { GameMap, Zone } from "@/lib/schema/map";
import { PlayerState } from "./player";

export interface GameStore {
  map: GameMap | null;
  players: Record<string, PlayerState>;
  myId: string;
  room: string;
  
  setMap: (data: GameMap) => void;
  resetMap: () => void;
  setId: (id: string) => void;
  updatePlayer: (data: PlayerState) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
  setRoom: (room: string) => void;
}

export type ToolType = "tile" | "object" | "collision" | "zone" | "spawn" | "eraser";

export interface EditorStore extends GameMap {
  activeTool: ToolType;
  selectedTile: number | null;
  selectedObject: string | null;
  selectedZoneType: Zone["type"] | null;

  setActiveTool: (tool: ToolType) => void;
  setTile: (x: number, y: number, tile: number) => void;
  setAllTiles: (tile: number) => void;
  setCollision: (x: number, y: number, blocked: boolean) => void;
  placeObject: (frame: string, x: number, y: number, width: number, height: number) => void;
  moveObject: (id: string, x: number, y: number) => void;
  removeObject: (id: string) => void;
  addZone: (zone: Zone) => void;
  removeZone: (id: string) => void;
  setSpawn: (x: number, y: number) => void;
  setSelectedTile: (tile: number | null) => void;
  setSelectedObject: (frame: string | null) => void;
  setSelectedZoneType: (type: Zone["type"] | null) => void;
  loadMap: (map: GameMap) => void;
  resetMap: () => void;
}


export interface CallStore {
  activeZoneId: string | null;
  participants: string[];
  connected: boolean;

  joinCall: (zoneId: string) => void;
  leaveCall: () => void;
  addParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
}