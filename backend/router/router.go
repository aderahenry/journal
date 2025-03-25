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
	categoryService *services.CategoryService,
	userService *services.UserService,
) *mux.Router {
	r := mux.NewRouter()

	// Initialize handlers
	journalHandler := handlers.NewJournalHandler(journalService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	userHandler := handlers.NewUserHandler(userService)

	// Apply middleware
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.AuthMiddleware(authService))

	// Journal routes
	r.HandleFunc("/api/entries", journalHandler.CreateEntry).Methods("POST")
	r.HandleFunc("/api/entries", journalHandler.ListEntries).Methods("GET")
	r.HandleFunc("/api/entries/stats", journalHandler.GetEntryStats).Methods("GET")
	r.HandleFunc("/api/entries/{id}", journalHandler.GetEntry).Methods("GET")
	r.HandleFunc("/api/entries/{id}", journalHandler.UpdateEntry).Methods("PUT")
	r.HandleFunc("/api/entries/{id}", journalHandler.DeleteEntry).Methods("DELETE")

	// Category routes
	r.HandleFunc("/api/categories", categoryHandler.GetCategories).Methods("GET")
	r.HandleFunc("/api/categories", categoryHandler.CreateCategory).Methods("POST")
	r.HandleFunc("/api/categories/{id}", categoryHandler.GetCategory).Methods("GET")
	r.HandleFunc("/api/categories/{id}", categoryHandler.UpdateCategory).Methods("PUT")
	r.HandleFunc("/api/categories/{id}", categoryHandler.DeleteCategory).Methods("DELETE")

	// User preference routes
	r.HandleFunc("/api/user/preferences", userHandler.GetUserPreferences).Methods("GET")
	r.HandleFunc("/api/user/preferences", userHandler.UpdateUserPreferences).Methods("PUT")
	r.HandleFunc("/api/user/preferences/debug", userHandler.DebugUserPreferences).Methods("GET")

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	return r
}
