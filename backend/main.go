package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"journal/db"
	"journal/handlers"
	"journal/internal/middleware"
	"journal/pkg/redis"
	"journal/router"
	"journal/services"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize Redis client
	redisClient, err := redis.NewClient(
		os.Getenv("REDIS_ADDR"),
		os.Getenv("REDIS_PASSWORD"),
		0,
	)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	// Initialize database connection
	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize services
	userService := services.NewUserService(database)
	journalService := services.NewJournalService(database)
	authService := services.NewAuthService(userService)
	categoryService := services.NewCategoryService(database)

	// Initialize handler
	authHandler := handlers.NewAuthHandler(authService)

	// Setup router
	r := router.SetupRouter(authService, journalService, categoryService, userService)

	// Configure rate limiting for auth routes
	loginRateLimitConfig := middleware.RateLimitConfig{
		Tokens:     3,              // 3 initial attempts
		RefillRate: 1.0 / 60.0,     // 1 attempt per minute (1/60 tokens per second)
		RefillTime: 24 * time.Hour, // Bucket expires after 24 hours
	}

	registerRateLimitConfig := middleware.RateLimitConfig{
		Tokens:     5,               // 5 attempts
		RefillRate: 0.2,             // 1 attempt every 5 seconds
		RefillTime: 5 * time.Minute, // Bucket expires after 5 minutes
	}

	// Apply rate limiting to auth routes
	authRouter := r.PathPrefix("/api/auth").Subrouter()

	// Apply specific rate limiting to login route
	loginRouter := authRouter.PathPrefix("/login").Subrouter()
	loginRouter.Use(middleware.RateLimit(redisClient, loginRateLimitConfig))
	loginRouter.HandleFunc("", authHandler.Login).Methods("POST")

	// Apply default rate limiting to register route
	registerRouter := authRouter.PathPrefix("/register").Subrouter()
	registerRouter.Use(middleware.RateLimit(redisClient, registerRateLimitConfig))
	registerRouter.HandleFunc("", authHandler.Register).Methods("POST")

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Vite's default port
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// Wrap the router with CORS middleware
	handler := c.Handler(r)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
