package protocol

import (
	"encoding/json"

	"github.com/ninad0x/pixel-office-ws/internal/player"
)

func encode(op int, data any) ([]byte, error) {
	return json.Marshal(Response{
		Op:   op,
		Data: data,
	})
}

func PlayerMoved(p *player.Player) ([]byte, error) {
	return encode(OpMove, PlayerState{
		Id:        p.Id,
		X:         p.X,
		Y:         p.Y,
		Direction: p.Direction,
		Moving:    p.Moving,
	})
}
