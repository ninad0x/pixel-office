package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/ninad0x/pixel-office-ws/internal/handler"
	"github.com/ninad0x/pixel-office-ws/internal/hub"
)

func main() {
	_ = godotenv.Load()

	h := hub.NewHub()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeWS(w, r, h)
	})

	http.HandleFunc("/debug/state", h.DebugState)
	fmt.Println("Echo server started at ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
