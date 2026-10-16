// Simple in-memory rate limiting middleware
// For production, use Redis-based rate limiting

const requestCounts = new Map();

export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = options.max || 100;

  // Clean up old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
      if (now - data.resetTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    const data = requestCounts.get(identifier);
    
    if (now - data.resetTime > windowMs) {
      data.count = 1;
      data.resetTime = now;
      return next();
    }

    if (data.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((data.resetTime + windowMs - now) / 1000)
      });
    }

    data.count++;
    next();
  };
}
