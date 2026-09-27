package types

import (
	"encoding/json"
)

// Opcodes
const (
	OpJoin          = 1
	OpMove          = 2
	OpLeave         = 3
	OpPlayersInRoom = 4
	OpPlayerJoined  = 5
	OpPlayerLeft    = 6
	OpCallStart     = 7
	OpCallEnd       = 8
)

// Incoming data shapes
type Message struct {
	Op   int             `json:"op"`
	Data json.RawMessage `json:"d"`
}

type JoinData struct {
	RoomId   string `json:"roomId"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

type MoveData struct {
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Direction string  `json:"direction"`
	Moving    bool    `json:"moving"`
}

// Outgoing shapes
type PlayerState struct {
	ID        string  `json:"id"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Direction string  `json:"direction"`
	Moving    bool    `json:"moving"`
}

type PlayerJoinedData struct {
	PlayerState
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

type PlayerLeftData struct {
	ID string `json:"id"`
}

type CallData struct {
	PeerID string `json:"peerId"`
}

type Response struct {
	Op   int `json:"op"`
	Data any `json:"d"`
}
