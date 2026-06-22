package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/coder/websocket"
)

func ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true, // allow all origins
	})
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close(websocket.StatusNormalClosure, "")

	log.Println("player connected")

	for {
		msgType, data, err := conn.Read(r.Context())
		println(msgType.String())
		fmt.Printf("%s", data)

		if err != nil {
			log.Println("read error:", err)
			break
		}
	}
}
