// Global middleware for security headers
// Applies to all routes in Cloudflare Pages

export async function onRequest(context) {
  // Get the response from the next function or page
  const response = await context.next();
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);
  
  // Security Headers
  const headers = newResponse.headers;
  
  // Content Security Policy - Tightened (no wildcards)
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openai.com https://api.web3forms.com https://cloudflareinsights.com; " +
    "frame-src 'self' https://challenges.cloudflare.com; " +
    "base-uri 'self'; " +
    "form-action 'self' https://api.web3forms.com; " +
    "frame-ancestors 'none';"
  );
  
  // HSTS - Force HTTPS for 1 year
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Disable browser features to reduce attack surface
  headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  // Spectre vulnerability mitigation
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Referrer policy - Only send referrer for same origin
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server identification headers
  headers.delete('Server');
  headers.delete('X-Powered-By');
  
  return newResponse;
}
