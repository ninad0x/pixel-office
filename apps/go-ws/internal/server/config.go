package server

import (
	"errors"
	"os"
)

type Config struct {
	Port      string
	AdminAddr string
	JWTSecret string
}

func Load() (Config, error) {
	cfg := Config{
		Port:      getenv("PORT", "8080"),
		AdminAddr: getenv("ADMIN_ADDR", "127.0.0.1:6060"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
	if cfg.JWTSecret == "" {
		return Config{}, errors.New("JWT_SECRET is required")
	}
	return cfg, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
