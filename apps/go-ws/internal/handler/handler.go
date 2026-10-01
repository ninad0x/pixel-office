package handler

import (
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/auth"
	"github.com/ninad0x/pixel-office-ws/internal/db"
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
	log.Println("ServeWS called")

	claims, err := getUserFromRequest(r)
	roomId := r.URL.Query().Get("roomId")

	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if roomId == "" {
		http.Error(w, "roomId required", http.StatusBadRequest)
		return
	}

	user, err := db.GetUserById(claims.UserId)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	// user := &db.User{Username: "test", Avatar: "default"}

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
		Username:    user.Username,
		Avatar:      user.Avatar,
		Send:        make(chan []byte, 32),
		Conn:        conn,
		ActivePeers: make(map[string]bool),
	}

	room := h.GetOrCreateRoom(roomId)

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

	fmt.Println(p)
}
