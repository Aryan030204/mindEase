import asyncHandler from "../utils/asyncHandler.js";
import { getRedisClient } from "../services/redis.service.js";

export const chatbotRateLimit = ({
  windowSeconds = Number(process.env.CHAT_RATE_LIMIT_WINDOW_SECONDS || 60),
  maxRequests = Number(process.env.CHAT_RATE_LIMIT_MAX || 12),
} = {}) =>
  asyncHandler(async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }

    const client = await getRedisClient();
    if (!client || !client.isOpen) {
      return next();
    }

    const key = `rate-limit:chat:${userId}`;
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, windowSeconds);
    }

    if (current > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many chat requests. Please slow down for a moment.",
      });
    }

    next();
  });
