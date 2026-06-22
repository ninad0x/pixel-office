package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ninad0x/pixel-office-ws/internal/handler"
)

func main() {

	http.HandleFunc("/ws", handler.ServeWS)
	fmt.Println("Echo server started at ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
