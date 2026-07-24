
export const Op = {
  JOIN: 1,
  MOVE: 2,
  LEAVE: 3,
  PLAYERS_IN_ROOM: 4,
  PLAYER_JOINED: 5,
  PLAYER_LEFT: 6,
  PING: 7
} as const;

export type OpCode = typeof Op[keyof typeof Op];

// Client to Server
export interface JoinRequest {}

export interface MoveRequest {
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  moving: boolean;
}

export interface LeaveRequest {}

export interface ClientPayloadMap {
  [Op.JOIN]: JoinRequest;
  [Op.MOVE]: MoveRequest;
  [Op.LEAVE]: LeaveRequest;
}

export interface ClientMessage<T extends keyof ClientPayloadMap = keyof ClientPayloadMap> {
  op: T;
  data: ClientPayloadMap[T];
}

// Server to Client
interface PlayerState {
  id: string;
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  moving: boolean;
}

export type PlayerMovedData = PlayerState 

export interface PlayerJoinedData extends PlayerState {
  username: string;
  avatar: string;
}

export type PlayersInRoomData = PlayerJoinedData[];

export interface PlayerLeftData {
  id: string;
}

export interface ServerPayloadMap {
  [Op.PLAYERS_IN_ROOM]: PlayersInRoomData;
  [Op.PLAYER_JOINED]: PlayerJoinedData;
  [Op.MOVE]: PlayerMovedData;
  [Op.PLAYER_LEFT]: PlayerLeftData;
}

export interface ServerMessage<T extends keyof ServerPayloadMap = keyof ServerPayloadMap> {
  op: T;
  data: ServerPayloadMap[T];
}