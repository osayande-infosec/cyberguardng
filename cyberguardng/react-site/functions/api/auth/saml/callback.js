// SAML SSO Callback - Handles SAML Response from IdP
// Validates assertion and creates session, logs to D1

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const SESSION_SECRET = context.env.SESSION_SECRET || "default-secret-change-me";
  const DB = context.env.DB; // D1 database binding
  
  console.log("SAML callback received at:", new Date().toISOString());
  
  try {
    const formData = await context.request.formData();
    const samlResponse = formData.get("SAMLResponse");
    const relayState = formData.get("RelayState");

    console.log("SAMLResponse length:", samlResponse?.length);
    console.log("RelayState:", relayState);

    if (!samlResponse) {
      console.log("No SAML response received");
      await logAuthEvent(DB, null, "saml", "failed", "No SAML response received");
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("No SAML response received")}`,
        302
      );
    }

    // Decode SAML Response
    const decodedResponse = atob(samlResponse);
    console.log("Decoded response length:", decodedResponse.length);
    
    // Parse and validate SAML Response
    const user = parseSAMLResponse(decodedResponse);
    console.log("Parsed user:", JSON.stringify(user));
    
    if (!user || !user.email) {
      console.log("Invalid SAML response - no user/email");
      await logAuthEvent(DB, null, "saml", "failed", "Invalid SAML response - no email");
      return Response.redirect(
        `${url.origin}/portal/login?error=${encodeURIComponent("Invalid SAML response - could not extract user email")}`,
        302
      );
    }

    // Log successful authentication to D1
    const dbUser = await upsertUser(DB, user);
    console.log("User saved to DB:", dbUser?.id);

    // Create session data
    const sessionData = {
      email: user.email,
      name: user.name || user.email.split("@")[0],
      picture: null,
      provider: "saml",
      providerId: user.nameId,
      userId: dbUser?.id,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };

    // Create signed session token (URL-safe base64)
    const sessionToken = await createSessionToken(sessionData, SESSION_SECRET);
    console.log("Session token created, length:", sessionToken.length);

    // Log successful login
    await logAuthEvent(DB, user.email, "saml", "success", "Login successful");

    // Redirect to portal with session cookie - matching Google auth pattern
    const redirectTo = relayState || `${url.origin}/portal`;
    console.log("Redirecting to:", redirectTo);
    
    // Use same pattern as Google OAuth callback
    const response = Response.redirect(redirectTo, 302);
    const headers = new Headers(response.headers);
    
    // Set session cookie (SameSite=Lax needed for cross-origin POST from IdP)
    headers.append(
      "Set-Cookie",
      `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`
    );

    return new Response(null, { status: 302, headers });

  } catch (error) {
    console.error("SAML callback error:", error);
    await logAuthEvent(DB, null, "saml", "error", error.message);
    return Response.redirect(
      `${url.origin}/portal/login?error=${encodeURIComponent("SAML authentication failed")}`,
      302
    );
  }
}

// Upsert user to D1 database
async function upsertUser(db, user) {
  if (!db) {
    console.log("D1 database not configured, skipping user save");
    return null;
  }
  
  try {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    // Check if user exists
    const existing = await db.prepare(
      "SELECT id FROM users WHERE email = ? AND provider = ?"
    ).bind(user.email, "saml").first();
    
    if (existing) {
      // Update last login
      await db.prepare(
        "UPDATE users SET last_login = ?, name = ?, updated_at = ? WHERE id = ?"
      ).bind(now, user.name || user.email.split("@")[0], now, existing.id).run();
      
      console.log("Updated existing user:", existing.id);
      return { id: existing.id };
    } else {
      // Insert new user
      await db.prepare(
        `INSERT INTO users (id, email, name, provider, provider_id, role, status, last_login, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        user.email,
        user.name || user.email.split("@")[0],
        "saml",
        user.nameId || user.email,
        "user",
        "active",
        now,
        now,
        now
      ).run();
      
      console.log("Created new user:", id);
      return { id };
    }
  } catch (error) {
    console.error("Database error saving user:", error);
    return null;
  }
}

// Log authentication event to D1
async function logAuthEvent(db, email, provider, status, message) {
  if (!db) {
    console.log("D1 not configured, skipping auth log");
    return;
  }
  
  try {
    // Check if auth_logs table exists, if not skip
    const tableCheck = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='auth_logs'"
    ).first();
    
    if (!tableCheck) {
      console.log("auth_logs table doesn't exist, skipping log");
      return;
    }
    
    await db.prepare(
      `INSERT INTO auth_logs (id, email, provider, status, message, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      email || "unknown",
      provider,
      status,
      message,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error("Failed to log auth event:", error);
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

// Create signed session token with URL-safe base64 encoding
async function createSessionToken(data, secret) {
  const encoder = new TextEncoder();
  const payload = JSON.stringify(data);
  const payloadBase64 = base64UrlEncode(payload);
  
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

// URL-safe base64 encoding
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
