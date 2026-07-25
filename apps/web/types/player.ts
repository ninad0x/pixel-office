
export interface PlayerState {
  id: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  moving: boolean;
}