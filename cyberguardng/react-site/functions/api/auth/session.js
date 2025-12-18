// Session endpoint - Check if user is authenticated

export async function onRequestGet(context) {
  const SESSION_SECRET = context.env.SESSION_SECRET || "default-secret-change-me";
  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const sessionToken = cookies.session;

  if (!sessionToken) {
    return new Response(
      JSON.stringify({ authenticated: false }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Verify and decode session
    const sessionData = await verifySessionToken(sessionToken, SESSION_SECRET);
    
    if (!sessionData) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "Invalid session" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if session has expired
    if (new Date(sessionData.expiresAt) < new Date()) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "Session expired" }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Return user data (without sensitive info)
    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          email: sessionData.email,
          name: sessionData.name,
          picture: sessionData.picture,
          provider: sessionData.provider
        }
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Session verification error:", error);
    return new Response(
      JSON.stringify({ authenticated: false, error: "Session verification failed" }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Helper: Parse cookies from header
function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
}

// Helper: Verify signed session token
async function verifySessionToken(token, secret) {
  try {
    const [payloadBase64, signatureBase64] = token.split(".");
    
    if (!payloadBase64 || !signatureBase64) {
      return null;
    }

    const encoder = new TextEncoder();
    
    // Verify signature
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(payloadBase64));

    if (!isValid) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(atob(payloadBase64));
    return payload;

  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
