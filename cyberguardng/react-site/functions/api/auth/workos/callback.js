// Enterprise SSO callback - Handles the response from WorkOS
//
// WorkOS has already completed and verified the SAML/OIDC exchange with the
// customer's IdP by the time this runs — the `code` here is a WorkOS-issued
// authorization code, not an IdP assertion. Exchanging it for a profile is
// the entire replacement for what used to be hand-rolled XML parsing and
// (missing) signature verification. This app trusts WorkOS's verification,
// the same way it already trusts Google's for the Google login path.

import { createSessionToken, getSessionSecret, parseCookies } from "../../lib/session.js";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent(error)}`,
      302
    );
  }

  // Fails closed on a missing cookie, same as the Google callback — a
  // cross-site attacker who doesn't send the cookie must not slip through.
  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const storedState = cookies.workos_state;

  if (!state || !storedState || state !== storedState) {
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

  const WORKOS_CLIENT_ID = context.env.WORKOS_CLIENT_ID;
  const WORKOS_API_KEY = context.env.WORKOS_API_KEY;
  const SESSION_SECRET = getSessionSecret(context.env);

  if (!WORKOS_CLIENT_ID || !WORKOS_API_KEY) {
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("Enterprise SSO not configured")}`,
      302
    );
  }

  if (!SESSION_SECRET) {
    console.error("SESSION_SECRET is not configured — refusing to mint a session");
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("Server not configured")}`,
      302
    );
  }

  try {
    // Exchange the code for the verified profile WorkOS obtained from the
    // customer's IdP. WORKOS_API_KEY authenticates this server-to-server
    // call; it's never sent to or readable by the browser.
    const tokenResponse = await fetch("https://api.workos.com/sso/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: WORKOS_CLIENT_ID,
        client_secret: WORKOS_API_KEY,
        grant_type: "authorization_code",
        code
      })
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error("WorkOS token exchange failed:", tokenResponse.status, text);
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("SSO authentication failed")}`,
        302
      );
    }

    const data = await tokenResponse.json();
    const profile = data.profile;

    if (!profile || !profile.email) {
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("Could not get user information")}`,
        302
      );
    }

    const name =
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.email.split("@")[0];

    const sessionData = {
      email: profile.email,
      name,
      picture: null,
      provider: "workos",
      providerId: profile.id,
      connectionType: profile.connection_type || null,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };

    const sessionToken = await createSessionToken(sessionData, SESSION_SECRET);

    const response = Response.redirect(`${url.origin}/portal`, 302);
    const headers = new Headers(response.headers);

    headers.append(
      "Set-Cookie",
      `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
    );
    headers.append(
      "Set-Cookie",
      `workos_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
    );

    return new Response(null, { status: 302, headers });

  } catch (err) {
    console.error("WorkOS callback error:", err);
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("Authentication failed")}`,
      302
    );
  }
}
