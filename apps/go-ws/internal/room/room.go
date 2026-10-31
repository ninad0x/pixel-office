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
			r.handleJoin(event)

		case types.OpMove:
			r.handleMove(event)

		case types.OpLeave:
			r.handleLeave(event)
		}
	}

	fmt.Println("ROOM CLOSED")
}

// helper
func (r *Room) broadcast(msg []byte, exceptID string) {
	for _, p := range r.Players {
		if p.ID == exceptID {
			continue
		}

		select {
		case p.Send <- msg:
		default:
			log.Printf("Client %s buffer full, dropping message", p.ID)
		}
	}
}

func (r *Room) handleJoin(event player.Event) {
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

	r.broadcast(msg, "")

	// add to room
	r.Players[p.ID] = p

	// notify others
	joined, err := protocol.PlayerJoined(p)
	if err != nil {
		log.Println("encode error: ", err)
		return
	}

	r.broadcast(joined, p.ID)
}

func (r *Room) handleMove(event player.Event) {
	var moveData types.MoveData
	if err := json.Unmarshal(event.Msg.Data, &moveData); err != nil {
		log.Println("unmarshal error:", err)
		return
	}

	// update player
	p := r.Players[event.Player.ID]
	if p != event.Player {
		return
	}
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

	r.broadcast(msg, p.ID)

	checkCalls(r, p)
}

func (r *Room) handleLeave(event player.Event) {
	p := event.Player

	if r.Players[p.ID] != p {
		return
	}

	delete(r.Players, p.ID)
	close(p.Send)
	fmt.Println("LEAVE", p.ID, "players:", len(r.Players))

	if len(r.Players) == 0 {
		if r.OnClose != nil {
			r.OnClose(r.ID)
			close(r.Events)
		}
		return // nobody left to notify
	}

	msg, err := protocol.PlayerLeave(p.ID)
	if err != nil {
		log.Println("encode error: ", err)
		return
	}

	r.broadcast(msg, "")
}
