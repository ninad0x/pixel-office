import { z } from "zod";

export const MapObjectSchema = z.object({
  id: z.string(),
  sprite: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  collision: z.boolean(),
  interaction: z.enum(["none", "sit"]),
  facing: z.enum(["up", "down", "left", "right"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ZoneSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  type: z.enum(["meeting", "silent", "music", "portal"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GameMapSchema = z.object({
  spawn: z.object({ x: z.number(), y: z.number() }),
  floor: z.array(z.array(z.number())),
  collision: z.array(z.array(z.boolean())),
  objects: z.array(MapObjectSchema),
  zones: z.array(ZoneSchema),
  version: z.number(),
});


export type MapObject = z.infer<typeof MapObjectSchema>;
export type Zone = z.infer<typeof ZoneSchema>;
export type GameMap = z.infer<typeof GameMapSchema>;

export const TILE_SIZE = 32;
export const MAP_W = 25;
export const MAP_H = 25;