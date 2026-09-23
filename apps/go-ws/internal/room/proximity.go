package room

import (
	"fmt"

	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/protocol"
)

func checkProximity(r *Room, p *player.Player) {
	for _, other := range r.Players {
		if other.ID == p.ID {
			continue
		}

		dx := p.X - other.X
		dy := p.Y - other.Y
		distSq := dx*dx + dy*dy

		inCall := p.ActivePeers[other.ID]

		if !inCall && distSq <= enterRangeSq {
			fmt.Println("in range")
			startCall(p, other)
		} else if inCall && distSq > exitRangeSq {
			fmt.Println("out of range")
			endCall(p, other)
		}
	}
}

func startCall(p, other *player.Player) {
	p.ActivePeers[other.ID] = true
	other.ActivePeers[p.ID] = true

	if msg, err := protocol.ProximityJoin(other.ID); err == nil {
		p.Send <- msg
	}
	if msg, err := protocol.ProximityJoin(p.ID); err == nil {
		other.Send <- msg
	}
}

func endCall(p, other *player.Player) {
	delete(p.ActivePeers, other.ID)
	delete(other.ActivePeers, p.ID)

	if msg, err := protocol.ProximityLeave(other.ID); err == nil {
		p.Send <- msg
	}
	if msg, err := protocol.ProximityLeave(p.ID); err == nil {
		other.Send <- msg
	}
}
