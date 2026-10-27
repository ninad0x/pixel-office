package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"github.com/ninad0x/pixel-office-ws/internal/hub"
	"github.com/ninad0x/pixel-office-ws/internal/server"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	_ = godotenv.Load()

	if os.Getenv("JWT_SECRET") == "" {
		return errors.New("JWT_SECRET is required")
	}
	port := getenv("PORT", "8080")
	adminAddr := getenv("ADMIN_ADDR", "127.0.0.1:6060")

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	return server.Run(ctx, port, adminAddr, hub.NewHub())
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
