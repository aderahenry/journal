package middleware

import (
	"journal/pkg/redis"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

// RateLimitConfig holds configuration for rate limiting
type RateLimitConfig struct {
	Tokens     int           // Number of tokens in the bucket
	RefillRate float64       // Tokens per second
	RefillTime time.Duration // How long the bucket should exist
}

// RateLimit creates a middleware that implements rate limiting using Redis
func RateLimit(redisClient *redis.Client, config RateLimitConfig) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client IP
			clientIP := r.RemoteAddr
			if forwardedFor := r.Header.Get("X-Forwarded-For"); forwardedFor != "" {
				clientIP = forwardedFor
			}

			// Create a unique key for this client and endpoint
			key := "ratelimit:" + clientIP + ":" + r.URL.Path

			// Check rate limit
			limited, err := redisClient.RateLimit(r.Context(), key, config.Tokens, config.RefillRate, config.RefillTime)
			if err != nil {
				// Log the error but allow the request to proceed
				next.ServeHTTP(w, r)
				return
			}

			if limited {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "1")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error": "Too many requests. Please try again later."}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
