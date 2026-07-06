package room

import (
	"encoding/json"

	"github.com/ninad0x/pixel-office-ws/internal/message"
	"github.com/ninad0x/pixel-office-ws/internal/player"
)

type Room struct {
	Id      string
	Players map[string]*player.Player
	Events  chan player.Event
}

func (r *Room) Run() {

	for {
		event := <-r.Events

		switch event.Msg.Op {
		case message.OpJoin:
			// handleJoin(r, event)

		case message.OpMove:
			handleMove(r, event)

		case message.OpLeave:
			handleLeave(r, event.Player)
		}
	}
}

func handleMove(r *Room, event player.Event) {
	var moveData message.MoveData
	json.Unmarshal(event.Msg.Data, &moveData)

	// update player
	p := r.Players[event.Player.Id]
	p.X = moveData.X
	p.Y = moveData.Y
	p.Direction = moveData.Direction
	p.Moving = moveData.Moving

	// broadcast
	res, _ := json.Marshal(message.Response{
		Op: message.OpMove,
		Data: message.PlayerState{
			Id:        p.Id,
			X:         p.X,
			Y:         p.Y,
			Direction: p.Direction,
			Moving:    p.Moving,
		},
	})

	for _, other := range r.Players {
		if other.Id == p.Id {
			continue
		}
		other.Send <- res
	}
}

func handleLeave(r *Room, p *player.Player) {
	delete(r.Players, p.Id)
	close(p.Send)

	res, _ := json.Marshal(message.Response{
		Op:   message.OpLeave,
		Data: map[string]string{"id": p.Id},
	})

	for _, other := range r.Players {
		other.Send <- res
	}
}
