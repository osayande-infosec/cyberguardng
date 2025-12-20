// Database helper functions for D1
// Shared utilities for all API endpoints

// Generate a UUID
export function generateId() {
  return crypto.randomUUID();
}

// Get current ISO timestamp
export function now() {
  return new Date().toISOString();
}

// Verify user session and get user data
export async function getAuthenticatedUser(context) {
  const SESSION_SECRET = context.env.SESSION_SECRET || "default-secret-change-me";
  const cookies = parseCookies(context.request.headers.get("Cookie") || "");
  const sessionToken = cookies.session;

  if (!sessionToken) {
    return null;
  }

  try {
    const sessionData = await verifySessionToken(sessionToken, SESSION_SECRET);
    if (!sessionData || new Date(sessionData.expiresAt) < new Date()) {
      return null;
    }
    return sessionData;
  } catch {
    return null;
  }
}

// Get user from database with organization info
export async function getUserWithOrg(db, email) {
  const user = await db.prepare(`
    SELECT 
      u.*,
      o.name as org_name,
      o.status as org_status,
      o.subscription_tier
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.email = ?
  `).bind(email).first();
  
  return user;
}

// Check if user is a platform admin
export async function isPlatformAdmin(db, email) {
  const admin = await db.prepare(`
    SELECT * FROM platform_admins WHERE email = ?
  `).bind(email).first();
  
  return admin !== null;
}

// Log activity
export async function logActivity(db, { organizationId, userId, action, resourceType, resourceId, details, ipAddress }) {
  await db.prepare(`
    INSERT INTO activity_log (id, organization_id, user_id, action, resource_type, resource_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    generateId(),
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    details ? JSON.stringify(details) : null,
    ipAddress
  ).run();
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
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(base64UrlDecode(signatureBase64), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(payloadBase64));

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadBase64));
    return payload;

  } catch {
    return null;
  }
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  return decodeURIComponent(escape(atob(base64)));
}

// JSON response helper
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

// Error response helper
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
