package protocol

import "encoding/json"

// Opcodes
const (
	OpJoin          = 1
	OpMove          = 2
	OpLeave         = 3
	OpPlayersInRoom = 4
	OpPlayerJoined  = 5
	OpPlayerLeft    = 6
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
	Id        string  `json:"id"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Direction string  `json:"direction"`
	Moving    bool    `json:"moving"`
}

type Response struct {
	Op   int `json:"op"`
	Data any `json:"d"`
}

type PlayerJoinedData struct {
	PlayerState
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}
