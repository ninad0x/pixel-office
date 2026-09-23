package room

import (
	"testing"

	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

func TestHandleLeave_RemovesPlayer(t *testing.T) {
	r := &Room{
		ID:      "room1",
		Players: make(map[string]*player.Player),
		Events:  make(chan player.Event),
	}

	p := &player.Player{ID: "p1", Send: make(chan []byte, 1)}
	r.Players[p.ID] = p

	handleLeave(r, player.Event{Msg: types.Message{types.OpLeave, nil}, Player: p})

	if _, exists := r.Players[p.ID]; exists {
		t.Error("expected player to be removed from room")
	}
}

func TestHandleLeave_TriggersOnCloseWhenEmpty(t *testing.T) {
	closed := false
	r := &Room{
		ID:      "room1",
		Players: make(map[string]*player.Player),
		Events:  make(chan player.Event),
		OnClose: func(ID string) { closed = true },
	}

	p := &player.Player{ID: "p1", Send: make(chan []byte, 1)}
	r.Players[p.ID] = p

	handleLeave(r, player.Event{Msg: types.Message{types.OpLeave, nil}, Player: p})

	if !closed {
		t.Error("expected OnClose to be called when last player leaves")
	}
}
