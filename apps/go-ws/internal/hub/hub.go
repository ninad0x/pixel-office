package hub

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/room"
)

type Hub struct {
	Rooms map[string]*room.Room
	mu    sync.Mutex
}

// handle rooms

func NewHub() *Hub {
	return &Hub{
		Rooms: make(map[string]*room.Room),
	}
}

func (h *Hub) GetOrCreateRoom(id string) *room.Room {
	h.mu.Lock()
	defer h.mu.Unlock()
	// if room exists
	if room, ok := h.Rooms[id]; ok {
		// fmt.Println("ROOM FOUND", id)
		return room
	}

	// get zones for room
	// zones, err := room.FetchZones(id)
	// if err != nil {
	// 	log.Printf("failed to fetch zones for room %s: %v", id, err)
	// 	zones = nil
	// }

	zone := room.ZoneBounds{
		ID:   5,
		Name: "meeting-zone-1",
		MinX: 705,
		MaxX: 705 + 318, // 1023
		MinY: 449,
		MaxY: 449 + 191, // 640
	}

	// create room instance
	room := &room.Room{
		ID:           id,
		Players:      make(map[string]*player.Player),
		Events:       make(chan player.Event),
		MeetingZones: []room.ZoneBounds{zone},
		OnClose: func(roomId string) {
			h.mu.Lock()
			defer h.mu.Unlock()
			delete(h.Rooms, roomId)
		},
	}
	fmt.Println("CREATED ROOM", room.ID)

	h.Rooms[id] = room
	go room.Run()
	return room
}

// debug EP
func (h *Hub) DebugState(w http.ResponseWriter, r *http.Request) {
	h.mu.Lock()
	defer h.mu.Unlock()

	type RoomState struct {
		ID      string   `json:"id"`
		Players []string `json:"players"`
	}

	var rooms []RoomState

	for id, room := range h.Rooms {
		players := make([]string, 0, len(room.Players))

		for playerID := range room.Players {
			players = append(players, playerID)
		}

		rooms = append(rooms, RoomState{
			ID:      id,
			Players: players,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rooms)
}
