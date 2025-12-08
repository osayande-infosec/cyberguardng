// Cloudflare Pages Function for consent logging
import { rateLimit, addRateLimitHeaders } from './rate-limiter.js';

export async function onRequestPost(context) {
  // Rate limiting: 20 requests per minute
  const rateLimitResult = await rateLimit(context, {
    limit: 20,
    window: 60,
    keyPrefix: 'consent'
  });
  
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }
  
  try {
    const body = await context.request.json();
    
    // Log consent event (in production, you'd store this in a database)
    console.log("Consent event:", {
      timestamp: new Date().toISOString(),
      categories: body.categories || {},
      userAgent: context.request.headers.get("user-agent"),
    });

    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
