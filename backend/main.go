package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"golang.org/x/net/context"
)

var (
	ctx             = context.Background()
	redisClient     *redis.Client
	totalClicksKey  = "total_clicks"
	clickQueueKey   = "click_queue"
	rateLimitPrefix = "rate_limit:"
)

// Optional, just for a fun
// A Go implementation of the typical index.ts

func main() {
	// Initialize Redis client first
	initRedis()

	app := fiber.New()

	// Middleware
	app.Use(cors.New())

	// Click processing goroutine
	go processClickQueue()

	// Routes with selective middleware application
	app.Post("/api/click", rateLimitMiddleware, handlePostClick)
	app.Get("/api/clicks", handleGetClicks)
	app.Get("/api/rate-limit-status", handleRateLimitStatus)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.Listen(":" + port))
}

// Initialize Redis client
func initRedis() {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // No password set
		DB:       0,  // Use default DB
	})
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Successfully connected to Redis")
}

// Rate limiting middleware
func rateLimitMiddleware(c *fiber.Ctx) error {
	ip := c.IP()
	rateKey := rateLimitPrefix + ip

	// Increment the request count with an expiry only if the key does not exist yet
	reqCount, err := redisClient.Incr(ctx, rateKey).Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Internal Server Error"})
	}

	// Set expiry only if it's a new key (first request in the 10-second window)
	if reqCount == 1 {
		redisClient.Expire(ctx, rateKey, 10*time.Second)
	}

	// Check if requests exceeded
	if reqCount > 10 {
		ttl, _ := redisClient.TTL(ctx, rateKey).Result()
		return c.Status(429).JSON(fiber.Map{
			"error":         "Rate limit exceeded",
			"message":       "Maximum 10 clicks per 10 seconds allowed",
			"timeRemaining": int(ttl.Seconds()),
		})
	}

	return c.Next()
}

// Click processor function
func processClickQueue() {
	for {
		click, err := redisClient.LPop(ctx, clickQueueKey).Result()
		if err == redis.Nil {
			time.Sleep(100 * time.Millisecond)
			continue
		} else if err != nil {
			log.Println("Error processing click queue:", err)
			continue
		}

		if click != "" {
			redisClient.Incr(ctx, totalClicksKey)
			totalClicks, _ := redisClient.Get(ctx, totalClicksKey).Result()
			log.Println("Processed click, new total:", totalClicks)
		}
	}
}

// Handle POST /api/click
func handlePostClick(c *fiber.Ctx) error {
	_, err := redisClient.RPush(ctx, clickQueueKey, "click").Result()
	if err != nil {
		log.Println("Error processing click:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process click"})
	}

	totalClicks, _ := redisClient.Get(ctx, totalClicksKey).Result()
	totalClicksInt, _ := strconv.Atoi(totalClicks)
	return c.JSON(fiber.Map{
		"success":     true,
		"totalClicks": totalClicksInt,
		"message":     "Click queued successfully",
	})
}

// Handle GET /api/clicks
func handleGetClicks(c *fiber.Ctx) error {
	totalClicks, _ := redisClient.Get(ctx, totalClicksKey).Result()
	queueLength, _ := redisClient.LLen(ctx, clickQueueKey).Result()

	totalClicksInt, _ := strconv.Atoi(totalClicks)
	return c.JSON(fiber.Map{
		"totalClicks":  totalClicksInt,
		"queuedClicks": int(queueLength),
	})
}

// Handle GET /api/rate-limit-status
func handleRateLimitStatus(c *fiber.Ctx) error {
	ip := c.IP()
	rateKey := rateLimitPrefix + ip

	requests, _ := redisClient.Get(ctx, rateKey).Result()
	ttl, _ := redisClient.TTL(ctx, rateKey).Result()

	reqCount, _ := strconv.Atoi(requests)
	return c.JSON(fiber.Map{
		"requests":      reqCount,
		"timeRemaining": int(ttl.Seconds()),
		"ip":            ip,
	})
}
