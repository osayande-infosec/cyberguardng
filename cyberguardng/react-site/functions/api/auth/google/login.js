// Google OAuth Login - Initiates the OAuth flow
// Redirects user to Google's consent screen

export async function onRequestGet(context) {
  const GOOGLE_CLIENT_ID = context.env.GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    return new Response(
      JSON.stringify({ error: "Google OAuth not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  
  // Build the redirect URI
  const redirectUri = new URL(context.request.url);
  redirectUri.pathname = "/api/auth/google/callback";
  
  // Google OAuth authorization URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri.origin + redirectUri.pathname);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  // Set state cookie for validation
  const response = Response.redirect(authUrl.toString(), 302);
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  return new Response(response.body, {
    status: 302,
    headers
  });
}
