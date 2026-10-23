package auth

import (
	"errors"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserId   string `json:"userId"`
	Username string `json:"username"`
	RoomID   string `json:"roomId"`
	Avatar   string `json:"avatar"`
	Jti      string `json:"jti"`
	jwt.RegisteredClaims
}

var (
	usedTickets = make(map[string]time.Time)
	ticketMu    sync.Mutex
)

func init() {
	go func() {
		for {
			time.Sleep(60 * time.Second)
			ticketMu.Lock()
			for jti, t := range usedTickets {
				if time.Since(t) > 60*time.Second {
					delete(usedTickets, jti)
				}
			}
			ticketMu.Unlock()
		}
	}()
}

func ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{},
		func(token *jwt.Token) (any, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		},
		jwt.WithValidMethods([]string{"HS256"}),
	)

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims := token.Claims.(*Claims)
	if claims.Jti == "" {
		return nil, errors.New("missing jti")
	}

	ticketMu.Lock()
	_, alreadyUsed := usedTickets[claims.Jti]
	if !alreadyUsed {
		usedTickets[claims.Jti] = time.Now()
	}
	ticketMu.Unlock()
	if alreadyUsed {
		return nil, errors.New("ticket already used")
	}

	return claims, nil
}
