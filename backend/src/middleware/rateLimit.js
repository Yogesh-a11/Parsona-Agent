/**
 * Rate Limiting Middleware
 * - General API: 100 requests / 15 min per IP
 * - Chat endpoint: 20 requests / 15 min per IP
 */

const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again in 15 minutes.",
    retryAfter: "15 minutes",
  },
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Chat rate limit exceeded. Please slow down and try again.",
    retryAfter: "15 minutes",
  },
});

module.exports = { generalLimiter, chatLimiter };
