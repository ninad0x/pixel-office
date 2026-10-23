package handler

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/auth"
	"github.com/ninad0x/pixel-office-ws/internal/hub"
	"github.com/ninad0x/pixel-office-ws/internal/player"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

func getUserFromRequest(r *http.Request) (*auth.Claims, error) {
	ticket := r.URL.Query().Get("ticket")
	fmt.Printf("raw ticket query: %q\n", ticket)
	if ticket == "" {
		return nil, errors.New("missing ticket")
	}
	return auth.ParseToken(ticket)
}

func ServeWS(w http.ResponseWriter, r *http.Request, h *hub.Hub) {

	claims, err := getUserFromRequest(r)

	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	roomId := r.URL.Query().Get("roomId")

	if roomId == "" {
		http.Error(w, "roomId required", http.StatusBadRequest)
		return
	}

	if claims.RoomID != roomId {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	room := h.GetOrCreateRoom(roomId)

	if len(room.Players) >= 25 {
		http.Error(w, "Room is full", http.StatusConflict)
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true, // allow all origins
	})
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close(websocket.StatusNormalClosure, "")

	log.Println("player connected:", claims.Username)

	p := &player.Player{
		ID:          claims.UserId,
		Username:    claims.Username,
		Avatar:      claims.Avatar,
		Send:        make(chan []byte, 32),
		Conn:        conn,
		ActivePeers: make(map[string]bool),
	}

	// send join
	room.Events <- player.Event{
		Player: p,
		Msg:    types.Message{Op: types.OpJoin},
	}

	// handle disconnect when handler returns
	defer func() {
		room.Events <- player.Event{
			Player: p,
			Msg:    types.Message{Op: types.OpLeave},
		}
	}()

	go p.WritePump()
	p.ReadPump(room.Events)

	// fmt.Println(p)
}
