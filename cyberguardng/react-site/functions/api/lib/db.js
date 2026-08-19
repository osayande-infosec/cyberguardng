// Database helper functions for D1
// Shared utilities for all API endpoints

import { getSessionSecret, parseCookies, verifySessionToken } from "./session.js";

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
  const SESSION_SECRET = getSessionSecret(context.env);
  if (!SESSION_SECRET) {
    return null;
  }

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
  try {
    await db.prepare(`
      INSERT INTO activity_log (id, organization_id, user_id, action, resource_type, resource_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      generateId(),
      organizationId || 'system',
      userId || null,
      action || 'unknown',
      resourceType || null,
      resourceId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null
    ).run();
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging shouldn't break main operations
  }
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
