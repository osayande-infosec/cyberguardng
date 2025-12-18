// SAML SSO Login - Initiates SAML authentication flow
// This is a placeholder - full implementation requires IdP configuration

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  
  // Check if SAML is configured
  const SAML_IDP_SSO_URL = context.env.SAML_IDP_SSO_URL;
  const SAML_SP_ENTITY_ID = context.env.SAML_SP_ENTITY_ID || `${url.origin}`;
  
  if (!SAML_IDP_SSO_URL) {
    // SAML not configured - show informational message
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("Enterprise SSO is not configured. Please contact sales@cyberguardng.ca for setup.")}`,
      302
    );
  }

  // Generate SAML AuthnRequest ID
  const requestId = "_" + crypto.randomUUID().replace(/-/g, "");
  const issueInstant = new Date().toISOString();
  
  // Build SAML AuthnRequest
  const samlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest 
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${SAML_IDP_SSO_URL}"
    AssertionConsumerServiceURL="${url.origin}/api/auth/saml/callback"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
    <saml:Issuer>${SAML_SP_ENTITY_ID}</saml:Issuer>
    <samlp:NameIDPolicy 
        Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
        AllowCreate="true"/>
</samlp:AuthnRequest>`;

  // Encode for redirect binding
  const encoder = new TextEncoder();
  const compressed = await compress(encoder.encode(samlRequest));
  const samlRequestEncoded = btoa(String.fromCharCode(...new Uint8Array(compressed)));
  
  // Build redirect URL
  const redirectUrl = new URL(SAML_IDP_SSO_URL);
  redirectUrl.searchParams.set("SAMLRequest", samlRequestEncoded);
  redirectUrl.searchParams.set("RelayState", url.origin + "/portal");

  // Store request ID for validation
  const response = Response.redirect(redirectUrl.toString(), 302);
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `saml_request_id=${requestId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  return new Response(null, { status: 302, headers });
}

// Simple deflate compression using CompressionStream
async function compress(data) {
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  
  const chunks = [];
  const reader = cs.readable.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}
