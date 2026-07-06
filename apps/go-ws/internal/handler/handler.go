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
)

func getUserFromRequest(r *http.Request) (*auth.Claims, error) {
	cookie, err := r.Cookie("auth-token")
	if err != nil {
		return nil, errors.New("missing token")
	}
	return auth.ParseToken(cookie.Value)
}

func ServeWS(w http.ResponseWriter, r *http.Request, h *hub.Hub) {

	// claims, err := getUserFromRequest(r)
	claims := auth.Claims{UserId: "test-user-1"} // test user
	roomId := r.URL.Query().Get("roomId")

	fmt.Println(roomId)
	// if err != nil {
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }

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
		Id:   claims.UserId,
		Conn: conn,
		Send: make(chan []byte, 32),
	}

	room := h.GetOrCreateRoom(roomId)
	go p.ReadPump(room.Events)
	go p.WritePump()

	fmt.Println(p)
}
