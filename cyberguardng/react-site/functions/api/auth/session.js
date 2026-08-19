// Session endpoint - Check if user is authenticated

import { getSessionSecret, parseCookies, verifySessionToken } from "../lib/session.js";

export async function onRequestGet(context) {
  const SESSION_SECRET = getSessionSecret(context.env);
  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const sessionToken = cookies.session;

  if (!SESSION_SECRET || !sessionToken) {
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
