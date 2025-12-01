import { create } from "zustand";
import { EditorStore, MAP_H, MAP_W } from "../common/types";

export const useEditorStore = create<EditorStore>((set) => ({
  floor: Array.from({length: MAP_H}, () => Array(MAP_W).fill(-1)),
  areaType: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0)),
  objects: [],
  spawn: { x: 200, y: 200 },

  selectedTile: null,
  selectedObject: null,
  selectedArea: null,     


  // tiles
  setTile: (x, y, tile) =>
    set((s) => {
      const f = s.floor.map((r) => [...r]);
      f[y][x] = tile;
      return { floor: f };
    }),

  setAllTiles: (tile) =>
    set((s) => {
      const f = s.floor.map(() => Array(MAP_W).fill(tile));
      return { floor: f };
    }),


  // area painting
  setArea: (x, y, type) =>
    set((s) => {
      const a = s.areaType.map((r) => [...r]);
      a[y][x] = type;
      return { areaType: a };
    }),


  // objects
  placeObject: (sprite, x, y) =>
    set((s) => ({
      objects: [...s.objects, { id: crypto.randomUUID(), sprite, x, y }],
    })),

  moveObject: (id, x, y) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, x, y } : o)),
    })),


  // tool selection
  setSelectedTile: (tile) =>
    set({ selectedTile: tile, selectedObject: null, selectedArea: null }),

  setSelectedObject: (frame) =>
    set({ selectedObject: frame, selectedTile: null, selectedArea: null }),

  setSelectedArea: (type) =>
    set({ selectedArea: type, selectedTile: null, selectedObject: null }),
}));
