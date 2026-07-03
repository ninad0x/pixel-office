package roommanager

import (
	"github.com/ninad0x/pixel-office-ws/internal/message"
	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/room"
)

type Hub struct {
	Rooms map[string]*room.Room
}

// handle rooms

func NewHub() *Hub {
	return &Hub{
		Rooms: make(map[string]*room.Room),
	}
}

func (h *Hub) GetOrCreateRoom(id string) *room.Room {
	// if room exists
	if room, ok := h.Rooms[id]; ok {
		return room
	}

	// create room instance
	room := &room.Room{
		Id:      id,
		Players: make(map[string]*player.Player),
		Events:  make(chan message.Message),
	}

	h.Rooms[id] = room
	go room.Run()
	return room
}
