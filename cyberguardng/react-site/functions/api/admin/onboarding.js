// Admin Onboarding API - Manage onboarding requests
// Only accessible by platform admins

import { getAuthenticatedUser, isPlatformAdmin, generateId, logActivity, jsonResponse, errorResponse } from "../lib/db.js";

// GET - List all onboarding requests
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
    const requests = await db.prepare(`
      SELECT * FROM onboarding_requests
      ORDER BY 
        CASE status 
          WHEN 'pending' THEN 1 
          WHEN 'contacted' THEN 2 
          ELSE 3 
        END,
        created_at DESC
    `).all();

    return jsonResponse({
      requests: requests.results || []
    });

  } catch (error) {
    console.error("Admin onboarding list error:", error);
    return errorResponse("Failed to fetch requests", 500);
  }
}

// POST - Approve or reject onboarding request
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
    const { action, requestId, notes } = body;

    if (!requestId) {
      return errorResponse("Request ID required", 400);
    }

    // Get the request
    const request = await db.prepare(`
      SELECT * FROM onboarding_requests WHERE id = ?
    `).bind(requestId).first();

    if (!request) {
      return errorResponse("Request not found", 404);
    }

    switch (action) {
      case "approve": {
        // Create organization
        const orgId = generateId();
        
        await db.prepare(`
          INSERT INTO organizations (id, name, industry, contact_email, contact_name, status, subscription_tier)
          VALUES (?, ?, ?, ?, ?, 'active', 'standard')
        `).bind(
          orgId,
          request.company_name,
          request.industry,
          request.email,
          request.contact_name
        ).run();

        // Create user linked to organization
        const userId = generateId();
        
        await db.prepare(`
          INSERT INTO users (id, email, name, organization_id, role, is_org_admin, status)
          VALUES (?, ?, ?, ?, 'admin', 1, 'active')
        `).bind(
          userId,
          request.email,
          request.contact_name,
          orgId
        ).run();

        // Update request status
        await db.prepare(`
          UPDATE onboarding_requests 
          SET status = 'approved', 
              organization_id = ?,
              reviewed_by = ?,
              reviewed_at = datetime('now'),
              updated_at = datetime('now'),
              notes = ?
          WHERE id = ?
        `).bind(orgId, session.email, notes || 'Approved', requestId).run();

        // Log activity
        await logActivity(db, {
          organizationId: orgId,
          userId: null,
          action: "organization_approved",
          resourceType: "organization",
          resourceId: orgId,
          details: { companyName: request.company_name, approvedBy: session.email }
        });

        return jsonResponse({ 
          success: true, 
          organizationId: orgId,
          message: `Organization "${request.company_name}" created successfully`
        });
      }

      case "reject": {
        await db.prepare(`
          UPDATE onboarding_requests 
          SET status = 'rejected',
              reviewed_by = ?,
              reviewed_at = datetime('now'),
              updated_at = datetime('now'),
              notes = ?
          WHERE id = ?
        `).bind(session.email, notes || 'Rejected', requestId).run();

        return jsonResponse({ 
          success: true,
          message: `Request from "${request.company_name}" has been rejected`
        });
      }

      case "contact": {
        await db.prepare(`
          UPDATE onboarding_requests 
          SET status = 'contacted',
              updated_at = datetime('now'),
              notes = ?
          WHERE id = ?
        `).bind(notes || 'Contacted', requestId).run();

        return jsonResponse({ 
          success: true,
          message: "Request marked as contacted"
        });
      }

      default:
        return errorResponse("Invalid action. Use: approve, reject, or contact", 400);
    }

  } catch (error) {
    console.error("Admin onboarding action error:", error);
    return errorResponse("Action failed: " + error.message, 500);
  }
}
