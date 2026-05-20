// Lightweight In-Memory Rate Limiter for Cloudflare Pages Functions
// Tracks requests per IP address per sliding window (default: 20 per minute)

const ipMap = new Map<string, number[]>();

export function checkRateLimit(ip: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now();

  // Safeguard against memory growth: if the tracking map grows extremely large, 
  // prune any completely expired IP records.
  if (ipMap.size > 5000) {
    for (const [key, val] of ipMap.entries()) {
      const active = val.filter(ts => now - ts < windowMs);
      if (active.length === 0) {
        ipMap.delete(key);
      } else {
        ipMap.set(key, active);
      }
    }
  }

  const timestamps = ipMap.get(ip) || [];
  
  // Filter out any timestamps that fall outside the active rate limit window
  const activeTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    ipMap.set(ip, activeTimestamps);
    return false; // Limit exceeded!
  }

  activeTimestamps.push(now);
  ipMap.set(ip, activeTimestamps);
  return true; // Safe to proceed
}
