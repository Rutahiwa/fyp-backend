interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store: Map<key, RateLimitInfo>
const rateLimitStore = new Map<string, RateLimitInfo>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): { success: boolean, remaining: number } {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    // New record or expired record
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return { success: true, remaining: maxRequests - 1 };
  }

  // Active record
  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  
  if (record.count > maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining };
}

// Clean up expired records periodically (e.g. every hour) to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000).unref(); // unref prevents interval from blocking node exit

