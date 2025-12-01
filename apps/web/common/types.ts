export const TILE_SIZE = 32;
export const MAP_W = 25;
export const MAP_H = 25;

export interface BaseMapData {
  floor: number[][];
  areaType: number[][];
  objects: {
    id: string;
    sprite: string;
    x: number;
    y: number;
  }[];
  spawn: { 
    x: number; 
    y: number
  };
}

export interface EditorStore extends BaseMapData {
  selectedTile: number | null;
  selectedObject: string | null;
  selectedArea: number | null

  setTile: (x: number, y: number, tile: number) => void;
  setAllTiles: (tile: number) => void;
  setArea: (x: number, y: number, type: number) => void;

  placeObject: (frame: string, x: number, y: number) => void;
  moveObject: (id: string, x: number, y: number) => void;

  setSelectedTile: (tile: number | null) => void;
  setSelectedObject: (frame: string | null) => void;
  setSelectedArea: (area: number | null) => void
}

export interface PlayerData {
  id: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  moving: boolean;
  avatar: string;
}

export interface GameStore {
  map: BaseMapData | null;
  setMap: (data: BaseMapData) => void;
  resetMap: () => void;

  players: Record<string, PlayerData>;
  myId: string | null;

  setMyId: (id: string) => void;
  updatePlayer: (data: PlayerData) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
}
