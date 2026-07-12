package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect() error {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	fmt.Println(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}
	fmt.Println("DB Connected")
	Pool = pool
	return nil
}
