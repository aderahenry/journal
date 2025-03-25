package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	// Rate limiting LUA script using token bucket algorithm
	rateLimitScript = `
local key = KEYS[1]
local tokens = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local refillTime = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

-- Get current bucket state
local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
local currentTokens = tonumber(bucket[1]) or tokens
local lastRefill = tonumber(bucket[2]) or now

-- Calculate time passed and tokens to add
local timePassed = now - lastRefill
local tokensToAdd = math.floor(timePassed * refillRate)

-- Update bucket state
if tokensToAdd > 0 then
    currentTokens = math.min(tokens, currentTokens + tokensToAdd)
    lastRefill = now
end

-- Try to consume a token
if currentTokens > 0 then
    currentTokens = currentTokens - 1
    redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', lastRefill)
    redis.call('EXPIRE', key, refillTime)
    return 1
end

return 0
`
)

// Client wraps the Redis client with rate limiting functionality
type Client struct {
	rdb *redis.Client
}

// NewClient creates a new Redis client
func NewClient(addr string, password string, db int) (*Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	// Test connection
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	return &Client{rdb: rdb}, nil
}

// RateLimit checks if a request should be rate limited
func (c *Client) RateLimit(ctx context.Context, key string, tokens int, refillRate float64, refillTime time.Duration) (bool, error) {
	now := time.Now().Unix()
	script := redis.NewScript(rateLimitScript)

	result, err := script.Run(ctx, c.rdb, []string{key}, tokens, refillRate, refillTime.Seconds(), now).Int()
	if err != nil {
		return false, fmt.Errorf("failed to execute rate limit script: %v", err)
	}

	return result == 0, nil // true if rate limited (no tokens available)
}

// Close closes the Redis connection
func (c *Client) Close() error {
	return c.rdb.Close()
}
