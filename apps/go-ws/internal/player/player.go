package player

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/coder/websocket"
	"github.com/ninad0x/pixel-office-ws/internal/types"
)

type Player struct {
	Id        string
	Username  string
	Avatar    string
	X         float64
	Y         float64
	Direction string
	Moving    bool
	Conn      *websocket.Conn
	Send      chan []byte // send to browser
	LastSeen  time.Time
	PingSent  bool
}

type Event struct {
	Player *Player
	Msg    types.Message
}

const maxMessageSize = 2 * 1024

func (p *Player) ReadPump(events chan Event) {
	// reads FROM browser, feeds INTO room

	p.Conn.SetReadLimit(maxMessageSize)
	ctx := context.Background()

	for {
		_, msg, err := p.Conn.Read(ctx)
		if err != nil {
			return
		}

		var m types.Message
		if err := json.Unmarshal(msg, &m); err != nil {
			continue
		}

		// send from browser to room
		fmt.Println(m)
		events <- Event{
			Player: p,
			Msg:    m,
		}

	}
}

func (p *Player) WritePump() {
	const (
		pingInterval = 20 * time.Second
		writeTimeout = 5 * time.Second
	)

	ticker := time.NewTicker(pingInterval)

	defer func() {
		ticker.Stop()
		p.Conn.Close(websocket.StatusNormalClosure, "")
	}()

	for {
		select {
		case msg, ok := <-p.Send:
			if !ok {
				p.Conn.Close(websocket.StatusNormalClosure, "channel closed")
				return
			}

			writeCtx, writeCancel := context.WithTimeout(context.Background(), writeTimeout)
			err := p.Conn.Write(writeCtx, websocket.MessageText, msg)
			writeCancel()

			if err != nil {
				log.Printf("write failed for %s: %v", p.Id, err)
				return
			}

		case <-ticker.C:
			pingCtx, pingCancel := context.WithTimeout(context.Background(), writeTimeout)
			err := p.Conn.Ping(pingCtx)
			pingCancel()

			if err != nil {
				log.Printf("ping failed for %s: %v", p.Id, err)
				p.Conn.Close(websocket.StatusPolicyViolation, "ping timeout")
				return
			}
		}
	}
}
