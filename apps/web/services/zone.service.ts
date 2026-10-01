import { readFile } from "fs/promises";
import path from "path";

export interface ZoneBounds {
  id: number;
  name: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const getMapZones = async (mapFileName: string): Promise<ZoneBounds[]> => {
  const filePath = path.join(process.cwd(), "public", mapFileName);
  const fileData = await readFile(filePath, "utf-8");
  const tmj = JSON.parse(fileData);

  const zones: ZoneBounds[] = [];

  for (const layer of tmj.layers || []) {
    if (layer.type !== "objectgroup") continue;

    for (const obj of layer.objects || []) {
      const isMeetingZone =
        obj.type === "meetingZone" ||
        obj.class === "meetingZone" ||
        obj.properties?.some(
          (p: { name: string; value: string }) => p.name === "type" && p.value === "meetingZone"
        );

      if (isMeetingZone) {
        zones.push({
          id: obj.id,
          name: obj.name,
          minX: obj.x,
          maxX: obj.x + obj.width,
          minY: obj.y,
          maxY: obj.y + obj.height,
        });
      }
    }
  }

  return zones;
};