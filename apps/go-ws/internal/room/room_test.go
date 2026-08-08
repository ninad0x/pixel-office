package room

import (
	"testing"

	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

func TestHandleLeave_RemovesPlayer(t *testing.T) {
	r := &Room{
		Id:      "room1",
		Players: make(map[string]*player.Player),
		Events:  make(chan player.Event),
	}

	p := &player.Player{Id: "p1", Send: make(chan []byte, 1)}
	r.Players[p.Id] = p

	handleLeave(r, player.Event{Msg: types.Message{types.OpLeave, nil}, Player: p})

	if _, exists := r.Players[p.Id]; exists {
		t.Error("expected player to be removed from room")
	}
}

func TestHandleLeave_TriggersOnCloseWhenEmpty(t *testing.T) {
	closed := false
	r := &Room{
		Id:      "room1",
		Players: make(map[string]*player.Player),
		Events:  make(chan player.Event),
		OnClose: func(id string) { closed = true },
	}

	p := &player.Player{Id: "p1", Send: make(chan []byte, 1)}
	r.Players[p.Id] = p

	handleLeave(r, player.Event{Msg: types.Message{types.OpLeave, nil}, Player: p})

	if !closed {
		t.Error("expected OnClose to be called when last player leaves")
	}
}
