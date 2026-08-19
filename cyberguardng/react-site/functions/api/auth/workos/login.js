// Enterprise SSO login - Initiates the WorkOS SSO flow
//
// Replaces the previous hand-rolled SAML implementation. That implementation
// never verified the IdP's XML signature — it checked only that a
// <ds:Signature> element was present, not that it was valid — which meant
// anyone could forge an assertion claiming to be any user with any role.
// WorkOS terminates the actual SAML/OIDC handshake with the customer's IdP
// and hands back a verified profile; this app never parses IdP-signed XML.

export async function onRequestGet(context) {
  const WORKOS_CLIENT_ID = context.env.WORKOS_CLIENT_ID;

  if (!WORKOS_CLIENT_ID) {
    return new Response(
      JSON.stringify({ error: "Enterprise SSO not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const state = crypto.randomUUID();

  const redirectUri = new URL(context.request.url);
  redirectUri.pathname = "/api/auth/workos/callback";
  redirectUri.search = "";

  const authUrl = new URL("https://api.workos.com/sso/authorize");
  authUrl.searchParams.set("client_id", WORKOS_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  // A specific customer connection (their SAML/OIDC config in the WorkOS
  // dashboard) can be targeted with a `connection` or `organization` query
  // param once this app knows which customer is signing in — e.g. from a
  // subdomain or an email-domain lookup before redirecting here. Left
  // unset for now: WorkOS falls back to its hosted connection-selection
  // screen, which is the right default until that lookup exists.

  const response = Response.redirect(authUrl.toString(), 302);
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `workos_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  return new Response(response.body, { status: 302, headers });
}
