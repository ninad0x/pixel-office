package server

import (
	"context"
	"net/http"
	"net/http/pprof"
	"time"

	"github.com/ninad0x/pixel-office-ws/internal/handler"
	"github.com/ninad0x/pixel-office-ws/internal/hub"
)

func Run(ctx context.Context, port, adminAddr string, h *hub.Hub) error {
	// Public players
	pubMux := http.NewServeMux()
	pubMux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeWS(w, r, h)
	})
	pubMux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	public := &http.Server{
		Addr:              ":" + port,
		Handler:           pubMux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// admin
	admMux := http.NewServeMux()
	admMux.HandleFunc("/debug/pprof/", pprof.Index)
	admMux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	admMux.HandleFunc("/debug/pprof/trace", pprof.Trace)
	admMux.HandleFunc("/debug/state", h.DebugState)
	admin := &http.Server{
		Addr:              adminAddr,
		Handler:           admMux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errCh := make(chan error, 2)
	go func() { errCh <- public.ListenAndServe() }()
	go func() { errCh <- admin.ListenAndServe() }()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	admin.Shutdown(shutdownCtx)
	return public.Shutdown(shutdownCtx)
}
