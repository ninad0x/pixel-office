package room

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/protocol"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

type Room struct {
	ID           string
	Players      map[string]*player.Player
	Events       chan player.Event
	OnClose      func(roomId string)
	MeetingZones []ZoneBounds
}

const (
	enterRangeSq = 64 * 64   // 2 tiles at 32px
	exitRangeSq  = 120 * 120 // 5 tiles at 32px
)

func (r *Room) Run() {

	for event := range r.Events {

		switch event.Msg.Op {
		case types.OpJoin:
			handleJoin(r, event)

		case types.OpMove:
			handleMove(r, event)

		case types.OpLeave:
			handleLeave(r, event)
		}
	}

	fmt.Println("ROOM CLOSED")
}

func handleJoin(r *Room, event player.Event) {
	p := event.Player

	if old, exists := r.Players[p.ID]; exists {
		delete(r.Players, p.ID)
		old.Conn.Close(websocket.StatusCode(4001), "connected elsewhere")
		fmt.Printf("player connected elsewhere")
	}

	existing := make([]*player.Player, 0)

	for _, other := range r.Players {
		existing = append(existing, other)
	}

	// send existing players [] to new player
	msg, err := protocol.PlayersInRoom(existing)
	if err != nil {
		log.Println("encode error:", err)
		return
	}
	log.Println("PLAYERS_IN_ROOM payload:", string(msg))

	select {
	case p.Send <- msg:
	default:
		log.Printf("Client %s buffer full, dropping message", p.ID)
	}

	// add to room
	r.Players[p.ID] = p
	// fmt.Println("JOIN", p.ID, "players:", len(r.Players))

	// notify others
	joined, err := protocol.PlayerJoined(p)
	if err != nil {
		log.Println("encode error: ", err)
		return
	}
	// log.Println("PLAYER_JOINED payload:", string(joined))

	for _, other := range r.Players {
		if other.ID == p.ID {
			continue
		}
		other.Send <- joined
	}
}

func handleMove(r *Room, event player.Event) {
	var moveData types.MoveData
	if err := json.Unmarshal(event.Msg.Data, &moveData); err != nil {
		log.Println("unmarshal error:", err)
		return
	}

	// update player
	p := r.Players[event.Player.ID]
	p.X = moveData.X
	p.Y = moveData.Y
	p.Direction = moveData.Direction
	p.Moving = moveData.Moving

	// broadcast
	msg, err := protocol.PlayerMoved(p)
	if err != nil {
		log.Println("encode error: ", err)
		return
	}

	for _, other := range r.Players {
		if other.ID == p.ID {
			continue
		}
		other.Send <- msg
	}

	checkCalls(r, p)
}

func handleLeave(r *Room, event player.Event) {
	p := event.Player

	if current, ok := r.Players[p.ID]; ok && current == p {
		delete(r.Players, p.ID)
		fmt.Println("LEAVE", p.ID, "players:", len(r.Players))
		close(p.Send)
	}

	msg, err := protocol.PlayerLeave(p.ID)
	if err != nil {
		log.Println("encode error: ", err)
		return
	}

	for _, other := range r.Players {
		select {
		case other.Send <- msg:
		default:
			log.Printf("Client %s buffer full, dropping message", other.ID)
		}
	}

	if len(r.Players) == 0 && r.OnClose != nil {
		r.OnClose(r.ID)
		close(r.Events)
	}
}
