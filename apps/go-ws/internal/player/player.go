package player

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/message"
)

type Player struct {
	Id        string
	X         float64
	Y         float64
	Direction string
	Moving    bool
	Conn      *websocket.Conn
	Send      chan []byte // send to browser
}

type Event struct {
	Player *Player
	Msg    message.Message
}

func (p *Player) ReadPump(events chan Event) {
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
		events <- Event{
			Player: p,
			Msg:    m,
		}

	}
}

func (p *Player) WritePump() {
	// reads FROM send channel, writes TO browser
	ctx := context.Background()
	for msg := range p.Send {
		p.Conn.Write(ctx, websocket.MessageText, msg)
	}
}
