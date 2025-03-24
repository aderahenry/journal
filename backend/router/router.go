package router

import (
	"net/http"

	"journal/handlers"
	"journal/middleware"
	"journal/services"

	"github.com/gorilla/mux"
)

func SetupRouter(
	authService *services.AuthService,
	journalService *services.JournalService,
) *mux.Router {
	r := mux.NewRouter()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	journalHandler := handlers.NewJournalHandler(journalService)

	// Apply middleware
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.AuthMiddleware(authService))

	// Auth routes
	r.HandleFunc("/api/auth/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/auth/register", authHandler.Register).Methods("POST")

	// Journal routes
	r.HandleFunc("/api/entries", journalHandler.CreateEntry).Methods("POST")
	r.HandleFunc("/api/entries", journalHandler.ListEntries).Methods("GET")
	r.HandleFunc("/api/entries/stats", journalHandler.GetEntryStats).Methods("GET")
	r.HandleFunc("/api/entries/{id}", journalHandler.GetEntry).Methods("GET")
	r.HandleFunc("/api/entries/{id}", journalHandler.UpdateEntry).Methods("PUT")
	r.HandleFunc("/api/entries/{id}", journalHandler.DeleteEntry).Methods("DELETE")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	return r
}
