import { MAP_H, MAP_W, GameMap } from "@/lib/schema/map";
import { EditorStore, ToolType } from "@/types/store";
import { create } from "zustand";

const initialMapData = {
  floor: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(-1)),
  collision: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false)),
  objects: [],
  zones: [],
  spawn: { x: 200, y: 200 },
  version: 1,
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialMapData,
  activeTool: "tile",
  selectedTile: null,
  selectedObject: null,
  selectedZoneType: null,

  setActiveTool: (activeTool: ToolType) => set({ activeTool }),

  setTile: (x, y, tile) =>
    set((s) => {
      const f = s.floor.map((r) => [...r]);
      f[y]![x] = tile;
      return { floor: f };
    }),

  setAllTiles: (tile) =>
    set(() => ({
      floor: Array.from({ length: MAP_H }, () => Array(MAP_W).fill(tile)),
    })),

  setCollision: (x, y, blocked) =>
    set((s) => {
      const c = s.collision.map((r) => [...r]);
      c[y]![x] = blocked;
      return { collision: c };
    }),

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

  removeObject: (id) =>
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
    })),

  addZone: (zone) => set((s) => ({ zones: [...s.zones, zone] })),

  removeZone: (id) =>
    set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),

  setSpawn: (x, y) => set({ spawn: { x, y } }),

  setSelectedTile: (tile) =>
    set({
      selectedTile: tile,
      selectedObject: null,
      selectedZoneType: null,
      activeTool: "tile",
    }),

  setSelectedObject: (frame) =>
    set({
      selectedObject: frame,
      selectedTile: null,
      selectedZoneType: null,
      activeTool: "object",
    }),

  setSelectedZoneType: (type) =>
    set({
      selectedZoneType: type,
      selectedTile: null,
      selectedObject: null,
      activeTool: "zone",
    }),

  loadMap: (map: GameMap) => set({ ...map }),

  resetMap: () => set({ ...initialMapData }),
}));