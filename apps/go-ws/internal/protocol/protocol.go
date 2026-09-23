package protocol

import (
	"encoding/json"

	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

func encode(op int, data any) ([]byte, error) {
	return json.Marshal(types.Response{
		Op:   op,
		Data: data,
	})
}

func PlayerMoved(p *player.Player) ([]byte, error) {
	return encode(types.OpMove, types.PlayerState{
		ID:        p.ID,
		X:         p.X,
		Y:         p.Y,
		Direction: p.Direction,
		Moving:    p.Moving,
	})
}

func PlayerJoined(p *player.Player) ([]byte, error) {
	return encode(types.OpPlayerJoined, types.PlayerJoinedData{
		Username: p.Username,
		Avatar:   p.Avatar,
		PlayerState: types.PlayerState{
			ID:        p.ID,
			X:         p.X,
			Y:         p.Y,
			Direction: p.Direction,
			Moving:    p.Moving,
		},
	})
}

func PlayerLeave(ID string) ([]byte, error) {
	return encode(types.OpPlayerLeft, types.PlayerLeftData{
		ID: ID,
	})
}

func PlayersInRoom(players []*player.Player) ([]byte, error) {
	var states []types.PlayerJoinedData
	for _, p := range players {
		states = append(states, types.PlayerJoinedData{
			Username: p.Username,
			Avatar:   p.Avatar,
			PlayerState: types.PlayerState{
				ID:        p.ID,
				X:         p.X,
				Y:         p.Y,
				Direction: p.Direction,
				Moving:    p.Moving,
			},
		})
	}

	return encode(types.OpPlayersInRoom, states)
}

func ProximityJoin(peerID string) ([]byte, error) {
	return encode(types.OpCallStart, types.CallData{
		PeerID: peerID,
	})
}

func ProximityLeave(peerID string) ([]byte, error) {
	return encode(types.OpCallEnd, types.CallData{
		PeerID: peerID,
	})
}
