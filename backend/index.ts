// src/server/index.ts
import express from "express";
import Redis from "ioredis";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Redis client with better error handling
const redis = new Redis({
  host: "localhost",
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("Successfully connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Keys for Redis
const TOTAL_CLICKS_KEY = "total_clicks";
const CLICK_QUEUE_KEY = "click_queue";

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  const ip = req.ip;
  const rateKey = `rate_limit:${ip}`;

  try {
    // Get the current number of requests for this IP
    const requests = await redis.get(rateKey);

    if (requests && parseInt(requests) >= 10) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Maximum 10 clicks per 10 seconds allowed",
        timeRemaining: await redis.ttl(rateKey),
      });
    }

    // If this is the first request, set the counter to 1 with expiry
    if (!requests) {
      await redis.setex(rateKey, 10, 1); // 10 seconds expiry
    } else {
      // Increment the counter
      await redis.incr(rateKey);
    }

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    next(error);
  }
};

// Click processor function
const processClickQueue = async () => {
  try {
    const click = await redis.lpop(CLICK_QUEUE_KEY);
    if (click) {
      await redis.incr(TOTAL_CLICKS_KEY);
      console.log(
        "Processed click, new total:",
        await redis.get(TOTAL_CLICKS_KEY)
      );
    }
  } catch (error) {
    console.error("Error processing click queue:", error);
  }
};

// Start click processor interval
setInterval(processClickQueue, 100); // Process clicks every 100ms

// Routes
app.post("/api/click", rateLimitMiddleware, async (req, res) => {
  try {
    // Add click to queue instead of directly incrementing
    await redis.rpush(CLICK_QUEUE_KEY, "click");

    const totalClicks = (await redis.get(TOTAL_CLICKS_KEY)) || "0";
    res.json({
      success: true,
      totalClicks: parseInt(totalClicks),
      message: "Click queued successfully",
    });
  } catch (error) {
    console.error("Error processing click:", error);
    res.status(500).json({ error: "Failed to process click" });
  }
});

app.get("/api/clicks", async (req, res) => {
  try {
    const totalClicks = (await redis.get(TOTAL_CLICKS_KEY)) || "0";
    const queueLength = await redis.llen(CLICK_QUEUE_KEY);

    res.json({
      totalClicks: parseInt(totalClicks),
      queuedClicks: queueLength,
    });
  } catch (error) {
    console.error("Error getting click count:", error);
    res.status(500).json({ error: "Failed to get click count" });
  }
});

// Debug route to check rate limit status
app.get("/api/rate-limit-status", async (req, res) => {
  const ip = req.ip;
  const rateKey = `rate_limit:${ip}`;

  try {
    const requests = await redis.get(rateKey);
    const ttl = await redis.ttl(rateKey);

    res.json({
      requests: requests ? parseInt(requests) : 0,
      timeRemaining: ttl,
      ip: ip,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get rate limit status" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
