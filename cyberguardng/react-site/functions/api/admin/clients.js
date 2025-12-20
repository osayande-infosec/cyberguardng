// Admin API - Manage organizations and users
// Only accessible by platform admins

import { getAuthenticatedUser, isPlatformAdmin, generateId, now, logActivity, jsonResponse, errorResponse } from "../lib/db.js";

// GET - List all organizations
export async function onRequestGet(context) {
  const db = context.env.DB;
  
  if (!db) {
    return errorResponse("Database not configured", 500);
  }

  const session = await getAuthenticatedUser(context);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }

  const isAdmin = await isPlatformAdmin(db, session.email);
  if (!isAdmin) {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  try {
    const organizations = await db.prepare(`
      SELECT 
        o.*,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT cp.id) as compliance_count,
        COUNT(DISTINCT a.id) as assessment_count
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id
      LEFT JOIN compliance_programs cp ON cp.organization_id = o.id
      LEFT JOIN assessments a ON a.organization_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all();

    const pendingUsers = await db.prepare(`
      SELECT email, name, created_at 
      FROM users 
      WHERE organization_id IS NULL OR status = 'pending_approval'
      ORDER BY created_at DESC
    `).all();

    return jsonResponse({
      organizations: organizations.results || [],
      pendingUsers: pendingUsers.results || []
    });

  } catch (error) {
    console.error("Admin list error:", error);
    return errorResponse("Failed to fetch data", 500);
  }
}

// POST - Create organization or add user
export async function onRequestPost(context) {
  const db = context.env.DB;
  
  if (!db) {
    return errorResponse("Database not configured", 500);
  }

  const session = await getAuthenticatedUser(context);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }

  const isAdmin = await isPlatformAdmin(db, session.email);
  if (!isAdmin) {
    return errorResponse("Forbidden - Admin access required", 403);
  }

  try {
    const body = await context.request.json();
    const { action } = body;

    switch (action) {
      case "create_organization": {
        const { name, domain, industry, contactEmail, contactName, tier } = body;
        
        if (!name || !contactEmail) {
          return errorResponse("Name and contact email required", 400);
        }

        const orgId = generateId();
        
        await db.prepare(`
          INSERT INTO organizations (id, name, domain, industry, contact_email, contact_name, subscription_tier)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(orgId, name, domain || null, industry || null, contactEmail, contactName || null, tier || 'standard').run();

        await logActivity(db, {
          organizationId: orgId,
          userId: null,
          action: "organization_created",
          resourceType: "organization",
          resourceId: orgId,
          details: { name, createdBy: session.email }
        });

        return jsonResponse({ success: true, organizationId: orgId });
      }

      case "add_user": {
        const { email, name, organizationId, role, isOrgAdmin } = body;
        
        if (!email || !organizationId) {
          return errorResponse("Email and organization ID required", 400);
        }

        // Check if org exists
        const org = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(organizationId).first();
        if (!org) {
          return errorResponse("Organization not found", 404);
        }

        // Check if user already exists
        const existing = await db.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first();
        
        if (existing) {
          // Update existing user
          await db.prepare(`
            UPDATE users 
            SET organization_id = ?, role = ?, is_org_admin = ?, status = 'active', updated_at = datetime('now')
            WHERE email = ?
          `).bind(organizationId, role || 'viewer', isOrgAdmin ? 1 : 0, email).run();
        } else {
          // Create new user
          await db.prepare(`
            INSERT INTO users (id, email, name, organization_id, role, is_org_admin, status)
            VALUES (?, ?, ?, ?, ?, ?, 'active')
          `).bind(generateId(), email, name || null, organizationId, role || 'viewer', isOrgAdmin ? 1 : 0).run();
        }

        await logActivity(db, {
          organizationId,
          userId: null,
          action: "user_added",
          resourceType: "user",
          details: { email, role, addedBy: session.email }
        });

        return jsonResponse({ success: true });
      }

      case "add_platform_admin": {
        const { email, name, adminRole } = body;
        
        if (!email) {
          return errorResponse("Email required", 400);
        }

        await db.prepare(`
          INSERT OR REPLACE INTO platform_admins (id, email, name, role)
          VALUES (?, ?, ?, ?)
        `).bind(generateId(), email, name || null, adminRole || 'staff').run();

        return jsonResponse({ success: true });
      }

      default:
        return errorResponse("Invalid action", 400);
    }

  } catch (error) {
    console.error("Admin action error:", error);
    return errorResponse("Action failed: " + error.message, 500);
  }
}
