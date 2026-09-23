// room/zones.go
package room

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type ZoneBounds struct {
	ID   string  `json:"id"`
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

	return out.Zones, nil
}
