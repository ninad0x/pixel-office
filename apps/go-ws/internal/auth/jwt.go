package auth

import (
	"errors"
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserId   string `json:"userId"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func ParseToken(tokenStr string) (*Claims, error) {
	fmt.Printf("JWT_SECRET value: %q\n", os.Getenv("JWT_SECRET"))
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{},
		func(token *jwt.Token) (any, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		},
	)

	if err != nil || !token.Valid {
		fmt.Printf("parse error: %v, valid: %v\n", err, token != nil && token.Valid)
		return nil, errors.New("invalid token")
	}

	return token.Claims.(*Claims), nil
}
