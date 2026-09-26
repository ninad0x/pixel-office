// room/zones.go
package room

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/ninad0x/pixel-office-ws/internal/player"
)

type ZoneBounds struct {
	ID   int     `json:"id"`
	Name string  `json:"name"`
	MinX float64 `json:"minX"`
	MaxX float64 `json:"maxX"`
	MinY float64 `json:"minY"`
	MaxY float64 `json:"maxY"`
}

type zonesResponse struct {
	Zones []ZoneBounds `json:"zones"`
}

func FetchZones(roomId string) ([]ZoneBounds, error) {
	url := fmt.Sprintf("%s/api/internal/rooms/%s/zones", os.Getenv("NEXT_INTERNAL_URL"), roomId)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-internal-secret", os.Getenv("INTERNAL_API_SECRET"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("zones fetch failed: status %d", resp.StatusCode)
	}

	var out zonesResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}

	fmt.Println("--zones", out.Zones)

	return out.Zones, nil
}

func updatePlayerZone(r *Room, p *player.Player) {
	// sets moving player's zone
	for _, zone := range r.MeetingZones {
		if p.X >= zone.MinX && p.X <= zone.MaxX &&
			p.Y >= zone.MinY && p.Y <= zone.MaxY {
			p.CurrentZoneID = zone.ID
			return
		}
	}
	p.CurrentZoneID = 0
}

func checkCalls(r *Room, p *player.Player) {
	updatePlayerZone(r, p)

	for _, other := range r.Players {
		if other.ID == p.ID {
			continue
		}

		dx := p.X - other.X
		dy := p.Y - other.Y
		distSq := dx*dx + dy*dy

		inCall := p.ActivePeers[other.ID]

		inRange := distSq <= enterRangeSq
		if inCall {
			inRange = distSq <= exitRangeSq // hysteresis buffer while already in call
		}

		sameZone := p.CurrentZoneID != 0 && p.CurrentZoneID == other.CurrentZoneID

		var shouldBeInCall bool

		if p.CurrentZoneID != 0 || other.CurrentZoneID != 0 {
			shouldBeInCall = sameZone // zones present -> zone rules only
		} else {
			shouldBeInCall = inRange // no zones involved -> proximity rules
		}

		if !inCall && shouldBeInCall {
			fmt.Println("Call started")
			startCall(p, other)
		} else if inCall && !shouldBeInCall {
			fmt.Println("Call stopped")
			endCall(p, other)
		}
	}
}
