package db

import (
	"context"
	"fmt"
)

type User struct {
	ID       string
	Username string
	Avatar   string
}

func GetUserById(id string) (*User, error) {
	var u User
	err := Pool.QueryRow(
		context.Background(),
		`SELECT "id", "username", "avatarUrl" 
		 FROM "User" 
		 WHERE "id"=$1`,
		id,
	).Scan(&u.ID, &u.Username, &u.Avatar)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &u, nil
}
