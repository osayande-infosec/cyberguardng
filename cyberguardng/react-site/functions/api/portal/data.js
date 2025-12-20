// Portal data API - Returns client-specific dashboard data
// All data is isolated by organization_id

import { getAuthenticatedUser, getUserWithOrg, isPlatformAdmin, jsonResponse, errorResponse } from "../lib/db.js";

export async function onRequestGet(context) {
  const db = context.env.DB;
  
  if (!db) {
    return errorResponse("Database not configured", 500);
  }

  // Verify authentication
  const session = await getAuthenticatedUser(context);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    // Get user with organization info
    let user = await getUserWithOrg(db, session.email);
    
    // If user doesn't exist in DB, they're not an approved client
    if (!user) {
      // Check if they're a platform admin
      const isAdmin = await isPlatformAdmin(db, session.email);
      
      if (isAdmin) {
        return jsonResponse({
          access: "admin",
          user: {
            email: session.email,
            name: session.name,
            picture: session.picture,
            role: "platform_admin"
          },
          message: "Platform admin - access admin panel to manage clients"
        });
      }
      
      // Not approved - show pending state
      return jsonResponse({
        access: "pending",
        user: {
          email: session.email,
          name: session.name,
          picture: session.picture
        },
        message: "Your account is pending approval. Please contact CyberGuardNG to complete onboarding."
      });
    }

    // Check if user's org is active
    if (user.org_status !== "active") {
      return jsonResponse({
        access: "inactive",
        user: {
          email: user.email,
          name: user.name,
          organization: user.org_name
        },
        message: "Your organization's account is currently inactive. Please contact support."
      });
    }

    // User is approved - fetch their organization's data
    const orgId = user.organization_id;

    // Get compliance programs
    const compliance = await db.prepare(`
      SELECT * FROM compliance_programs 
      WHERE organization_id = ? 
      ORDER BY updated_at DESC
    `).bind(orgId).all();

    // Get recent assessments
    const assessments = await db.prepare(`
      SELECT * FROM assessments 
      WHERE organization_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `).bind(orgId).all();

    // Get recent documents
    const documents = await db.prepare(`
      SELECT * FROM documents 
      WHERE organization_id = ? AND status = 'approved'
      ORDER BY created_at DESC 
      LIMIT 10
    `).bind(orgId).all();

    // Get open support tickets
    const tickets = await db.prepare(`
      SELECT * FROM support_tickets 
      WHERE organization_id = ? AND status NOT IN ('resolved', 'closed')
      ORDER BY created_at DESC
    `).bind(orgId).all();

    // Get recent activity
    const activity = await db.prepare(`
      SELECT * FROM activity_log 
      WHERE organization_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).bind(orgId).all();

    // Update last login
    await db.prepare(`
      UPDATE users SET last_login = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(user.id).run();

    return jsonResponse({
      access: "granted",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: session.picture,
        role: user.role,
        isOrgAdmin: user.is_org_admin === 1
      },
      organization: {
        id: orgId,
        name: user.org_name,
        tier: user.subscription_tier
      },
      dashboard: {
        compliance: compliance.results || [],
        assessments: assessments.results || [],
        documents: documents.results || [],
        openTickets: tickets.results || [],
        recentActivity: activity.results || []
      }
    });

  } catch (error) {
    console.error("Portal data error:", error);
    return errorResponse("Failed to load portal data", 500);
  }
}
