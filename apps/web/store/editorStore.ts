import { create } from "zustand";
import { EditorStore, MAP_H, MAP_W } from "@/types/map";

export const useEditorStore = create<EditorStore>((set) => ({
  floor: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(-1)),
  collision: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false)),
  objects: [],
  zones: [],
  spawn: { x: 200, y: 200 },
  version: 1,

  selectedTile: null,
  selectedObject: null,
  selectedZoneType: null,

  // tiles
  setTile: (x, y, tile) =>
    set((s) => {
      const f = s.floor.map((r) => [...r]);
      f[y]![x] = tile;
      return { floor: f };
    }),

  setAllTiles: (tile) =>
    set((s) => {
      const f = s.floor.map(() => Array(MAP_W).fill(tile));
      return { floor: f };
    }),

  // collision painting
  setCollision: (x, y, blocked) =>
    set((s) => {
      const c = s.collision.map((r) => [...r]);
      c[y]![x] = blocked;
      return { collision: c };
    }),

  // objects
  placeObject: (sprite, x, y, width, height) =>
    set((s) => ({
      objects: [
        ...s.objects,
        {
          id: crypto.randomUUID(),
          sprite,
          x,
          y,
          width,
          height,
          collision: true,
          interaction: "none",
        },
      ],
    })),

  moveObject: (id, x, y) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, x, y } : o)),
    })),

  // zones
  addZone: (zone) =>
    set((s) => ({ zones: [...s.zones, zone] })),

  removeZone: (id) =>
    set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),

  // tool selection
  setSelectedTile: (tile) =>
    set({ selectedTile: tile, selectedObject: null, selectedZoneType: null }),

  setSelectedObject: (frame) =>
    set({ selectedObject: frame, selectedTile: null, selectedZoneType: null }),

  setSelectedZoneType: (type) =>
    set({ selectedZoneType: type, selectedTile: null, selectedObject: null }),
}));