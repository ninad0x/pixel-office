
export const TILE_SIZE = 32;
export const MAP_W = 25;
export const MAP_H = 25;

export interface MapObject {
  id: string;
  sprite: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collision: boolean;
  interaction: "none" | "sit";
  facing?: "up" | "down" | "left" | "right";
  metadata?: Record<string, unknown>;
}

export interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "meeting" | "silent" | "music" | "portal";
  metadata?: Record<string, unknown>;
}

export interface GameMap {
  spawn: { x: number; y: number };
  floor: number[][];
  collision: number[][];
  objects: MapObject[];
  zones: Zone[];
  version: number;
}


export interface EditorStore extends GameMap {
  selectedTile: number | null;
  selectedObject: string | null;
  selectedZoneType: Zone["type"] | null;

  setTile: (x: number, y: number, tile: number) => void;
  setAllTiles: (tile: number) => void;
  setCollision: (x: number, y: number, blocked: boolean) => void;

  placeObject: (frame: string, x: number, y: number, width: number, height: number) => void;
  moveObject: (id: string, x: number, y: number) => void;

  addZone: (zone: Zone) => void;
  removeZone: (id: string) => void;

  setSelectedTile: (tile: number | null) => void;
  setSelectedObject: (frame: string | null) => void;
  setSelectedZoneType: (type: Zone["type"] | null) => void;
}