package player

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/message"
)

type Player struct {
	Id   string
	X    int
	Y    int
	Conn *websocket.Conn
	Send chan []byte // send to browser
}

func (p *Player) ReadPump(events chan message.Message) {
	// reads FROM browser, feeds INTO room
	ctx := context.Background()
	for {
		_, msg, err := p.Conn.Read(ctx)
		if err != nil {
			return
		}

		var m message.Message
		if err := json.Unmarshal(msg, &m); err != nil {
			continue
		}

		// send from browser to room
		fmt.Println(msg)
		events <- m

	}
}

func (p *Player) writePump() {
	// reads FROM send channel, writes TO browser
	ctx := context.Background()
	for msg := range p.Send {
		p.Conn.Write(ctx, websocket.MessageText, msg)
	}
}
