package room

import "github.com/ninad0x/pixel-office-ws/internal/player"

type Room struct {
	Id      string
	players map[string]*player.Player
}

// handle join
// handle leave
