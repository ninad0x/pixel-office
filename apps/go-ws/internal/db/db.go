package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect() error {
	fmt.Println("DEBUG DB URL:", os.Getenv("DATABASE_URL"))
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}

	if err := pool.Ping(context.Background()); err != nil {
		return err
	}

	Pool = pool
	return nil
}
