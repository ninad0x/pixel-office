package player

import "github.com/coder/websocket"

type Player struct {
	Id   string
	X    int
	Y    int
	Conn *websocket.Conn
	Send chan []byte // send to browser
}
