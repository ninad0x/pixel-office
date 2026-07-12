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
	"github.com/ninad0x/pixel-office-ws/internal/message"
	"github.com/ninad0x/pixel-office-ws/internal/player"
)

func getUserFromRequest(r *http.Request) (*auth.Claims, error) {
	cookie, err := r.Cookie("auth-token")
	if err != nil {
		return nil, errors.New("missing token")
	}
	log.Println("cookie found:", cookie.Value[:20])
	return auth.ParseToken(cookie.Value)
}

func ServeWS(w http.ResponseWriter, r *http.Request, h *hub.Hub) {

	claims, err := getUserFromRequest(r)
	// claims := auth.Claims{UserId: "255c2f6f-de07-4689-97f6-ccf95c3d68a2"} // test user
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

	log.Println("player connected:", claims.UserId)

	p := &player.Player{
		Id:       claims.UserId,
		Username: user.Username,
		Avatar:   user.Avatar,
		Send:     make(chan []byte, 32),
		Conn:     conn,
	}

	room := h.GetOrCreateRoom(roomId)

	// send join
	room.Events <- player.Event{
		Player: p,
		Msg:    message.Message{Op: message.OpJoin},
	}

	// handle disconnect when handler returns
	defer func() {
		room.Events <- player.Event{
			Player: p,
			Msg:    message.Message{Op: message.OpLeave},
		}
	}()

	go p.WritePump()
	p.ReadPump(room.Events)

	fmt.Println(p)
}
