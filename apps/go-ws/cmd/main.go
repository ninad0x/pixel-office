package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/ninad0x/pixel-office-ws/internal/db"
	"github.com/ninad0x/pixel-office-ws/internal/handler"
	"github.com/ninad0x/pixel-office-ws/internal/hub"
)

func main() {
	err := godotenv.Load()
	fmt.Println(err)

	if err := db.Connect(); err != nil {

		log.Fatal("DB connection failed:", err)
	}
	defer db.Pool.Close()

	h := hub.NewHub()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeWS(w, r, h)
	})
	fmt.Println("Echo server started at ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
