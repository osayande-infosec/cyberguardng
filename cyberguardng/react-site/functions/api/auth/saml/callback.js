// SAML SSO Callback - Handles SAML Response from IdP
// Validates assertion and creates session

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const SESSION_SECRET = context.env.SESSION_SECRET || "default-secret-change-me";
  
  try {
    const formData = await context.request.formData();
    const samlResponse = formData.get("SAMLResponse");
    const relayState = formData.get("RelayState");

    if (!samlResponse) {
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("No SAML response received")}`,
        302
      );
    }

    // Decode SAML Response
    const decodedResponse = atob(samlResponse);
    
    // Parse and validate SAML Response
    // Note: In production, you should:
    // 1. Validate XML signature
    // 2. Check Issuer matches expected IdP
    // 3. Verify NotBefore and NotOnOrAfter
    // 4. Check Audience matches SP Entity ID
    // 5. Validate InResponseTo matches our request ID
    
    const user = parseSAMLResponse(decodedResponse);
    
    if (!user || !user.email) {
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("Invalid SAML response")}`,
        302
      );
    }

    // Create session data
    const sessionData = {
      email: user.email,
      name: user.name || user.email.split("@")[0],
      picture: null,
      provider: "saml",
      providerId: user.nameId,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };

    // Create signed session token
    const sessionToken = await createSessionToken(sessionData, SESSION_SECRET);

    // Redirect to portal (or RelayState)
    const redirectTo = relayState || `${url.origin}/portal`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectTo,
        "Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
      }
    });

  } catch (error) {
    console.error("SAML callback error:", error);
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("SAML authentication failed")}`,
      302
    );
  }
}

// Simple SAML Response parser (basic implementation)
// In production, use a proper XML parser with signature validation
function parseSAMLResponse(xmlString) {
  try {
    // Extract NameID (email)
    const nameIdMatch = xmlString.match(/<(?:saml2?:)?NameID[^>]*>([^<]+)<\/(?:saml2?:)?NameID>/i);
    const email = nameIdMatch ? nameIdMatch[1].trim() : null;

    // Extract attributes
    let name = null;
    
    // Try to find FirstName/LastName or displayName attributes
    const firstNameMatch = xmlString.match(/Name="(?:firstName|first_name|givenName)"[^>]*>\s*<(?:saml2?:)?AttributeValue[^>]*>([^<]+)/i);
    const lastNameMatch = xmlString.match(/Name="(?:lastName|last_name|surname)"[^>]*>\s*<(?:saml2?:)?AttributeValue[^>]*>([^<]+)/i);
    const displayNameMatch = xmlString.match(/Name="(?:displayName|name)"[^>]*>\s*<(?:saml2?:)?AttributeValue[^>]*>([^<]+)/i);
    
    if (displayNameMatch) {
      name = displayNameMatch[1].trim();
    } else if (firstNameMatch && lastNameMatch) {
      name = `${firstNameMatch[1].trim()} ${lastNameMatch[1].trim()}`;
    } else if (firstNameMatch) {
      name = firstNameMatch[1].trim();
    }

    return {
      email,
      name,
      nameId: email
    };
  } catch (error) {
    console.error("SAML parsing error:", error);
    return null;
  }
}

// Create signed session token
async function createSessionToken(data, secret) {
  const encoder = new TextEncoder();
  const payload = JSON.stringify(data);
  const payloadBase64 = btoa(payload);
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${payloadBase64}.${signatureBase64}`;
}
