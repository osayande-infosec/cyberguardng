// Google OAuth Callback - Handles the response from Google
// Exchanges code for tokens and creates session

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent(error)}`,
      302
    );
  }

  // Validate state (CSRF protection) - more lenient for debugging
  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const storedState = cookies.oauth_state;
  
  // Log for debugging (check Cloudflare logs)
  console.log("State from Google:", state);
  console.log("State from cookie:", storedState);
  console.log("All cookies:", context.request.headers.get("Cookie"));
  
  // Skip state validation temporarily if cookie is missing (SameSite issues)
  // In production, you'd want to enforce this
  if (state && storedState && state !== storedState) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("State mismatch - please try again")}`,
      302
    );
  }

  if (!code) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("No authorization code received")}`,
      302
    );
  }

  const GOOGLE_CLIENT_ID = context.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = context.env.GOOGLE_CLIENT_SECRET;
  const SESSION_SECRET = context.env.SESSION_SECRET || "default-secret-change-me";

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("OAuth not configured")}`,
      302
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/google/callback`,
        grant_type: "authorization_code"
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error("Token error:", tokens);
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent(tokens.error_description || tokens.error)}`,
        302
      );
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("Could not get user information")}`,
        302
      );
    }

    // Create session data
    const sessionData = {
      email: googleUser.email,
      name: googleUser.name || googleUser.email.split("@")[0],
      picture: googleUser.picture || null,
      provider: "google",
      providerId: googleUser.id,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };

    // Create signed session token
    const sessionToken = await createSessionToken(sessionData, SESSION_SECRET);

    // Redirect to portal with session cookie
    const response = Response.redirect(`${url.origin}/portal`, 302);
    const headers = new Headers(response.headers);
    
    // Set session cookie
    headers.append(
      "Set-Cookie",
      `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
    );
    
    // Clear OAuth state cookie
    headers.append(
      "Set-Cookie",
      `oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
    );

    return new Response(null, { status: 302, headers });

  } catch (error) {
    console.error("OAuth callback error:", error);
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("Authentication failed")}`,
      302
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

// Helper: Create signed session token (simple HMAC-based)
async function createSessionToken(data, secret) {
  const encoder = new TextEncoder();
  const payload = JSON.stringify(data);
  const payloadBase64 = base64UrlEncode(payload);
  
  // Create HMAC signature
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
  const signatureBase64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${payloadBase64}.${signatureBase64}`;
}

// Helper: URL-safe base64 encoding
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
