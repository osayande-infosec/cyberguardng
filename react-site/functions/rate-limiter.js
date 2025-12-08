// Rate limiting utility for Cloudflare Functions
// Uses KV storage to track request counts per IP

export async function rateLimit(context, options = {}) {
  const {
    limit = 10, // requests allowed
    window = 60, // time window in seconds
    keyPrefix = 'ratelimit'
  } = options;

  const ip = context.request.headers.get('CF-Connecting-IP') || 
             context.request.headers.get('X-Forwarded-For') || 
             'unknown';
  
  const key = `${keyPrefix}:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  
  try {
    // Get existing request log
    const data = await context.env.KV.get(key, 'json');
    let requests = data?.requests || [];
    
    // Filter out requests outside the time window
    requests = requests.filter(timestamp => now - timestamp < window);
    
    // Check if rate limit exceeded
    if (requests.length >= limit) {
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + window;
      const retryAfter = resetTime - now;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter,
        response: new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: `${retryAfter} seconds`,
            limit,
            window: `${window} seconds`
          }), 
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString()
            }
          }
        )
      };
    }
    
    // Add current request
    requests.push(now);
    
    // Save to KV with TTL
    await context.env.KV.put(
      key, 
      JSON.stringify({ requests, lastUpdate: now }),
      { expirationTtl: window + 60 } // Extra 60s buffer
    );
    
    return {
      allowed: true,
      remaining: limit - requests.length,
      resetTime: requests[0] + window,
      response: null
    };
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request (fail open)
    return { allowed: true, remaining: limit, error: error.message };
  }
}

// Helper to add rate limit headers to responses
export function addRateLimitHeaders(response, rateLimit) {
  if (!rateLimit || !response) return response;
  
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  if (rateLimit.resetTime) {
    headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
