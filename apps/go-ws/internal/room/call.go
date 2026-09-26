package room

import (
	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/protocol"
)

func startCall(p, other *player.Player) {
	p.ActivePeers[other.ID] = true
	other.ActivePeers[p.ID] = true

	if msg, err := protocol.CallStart(other.ID); err == nil {
		p.Send <- msg
	}
	if msg, err := protocol.CallStart(p.ID); err == nil {
		other.Send <- msg
	}
}

func endCall(p, other *player.Player) {
	delete(p.ActivePeers, other.ID)
	delete(other.ActivePeers, p.ID)

	if msg, err := protocol.CallEnd(other.ID); err == nil {
		p.Send <- msg
	}
	if msg, err := protocol.CallEnd(p.ID); err == nil {
		other.Send <- msg
	}
}
