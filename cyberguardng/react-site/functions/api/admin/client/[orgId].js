// Admin API - Manage individual client data
// Endpoints for compliance programs, documents, assessments

import { getAuthenticatedUser, isPlatformAdmin, generateId, jsonResponse, errorResponse } from "../../lib/db.js";

// GET - Get client details with all data
export async function onRequestGet(context) {
  const db = context.env.DB;
  const { orgId } = context.params;
  
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
    // Get organization details
    const org = await db.prepare(`
      SELECT * FROM organizations WHERE id = ?
    `).bind(orgId).first();

    if (!org) {
      return errorResponse("Organization not found", 404);
    }

    // Get users
    const users = await db.prepare(`
      SELECT id, email, name, role, is_org_admin, status, last_login, created_at
      FROM users WHERE organization_id = ?
      ORDER BY created_at DESC
    `).bind(orgId).all();

    // Get compliance programs
    const compliance = await db.prepare(`
      SELECT * FROM compliance_programs WHERE organization_id = ?
      ORDER BY created_at DESC
    `).bind(orgId).all();

    // Get assessments
    const assessments = await db.prepare(`
      SELECT * FROM assessments WHERE organization_id = ?
      ORDER BY created_at DESC
    `).bind(orgId).all();

    // Get documents
    const documents = await db.prepare(`
      SELECT * FROM documents WHERE organization_id = ?
      ORDER BY created_at DESC
    `).bind(orgId).all();

    // Get activity log (last 50)
    const activity = await db.prepare(`
      SELECT * FROM activity_log WHERE organization_id = ?
      ORDER BY created_at DESC LIMIT 50
    `).bind(orgId).all();

    // Get support tickets
    const tickets = await db.prepare(`
      SELECT * FROM support_tickets WHERE organization_id = ?
      ORDER BY created_at DESC
    `).bind(orgId).all();

    return jsonResponse({
      organization: org,
      users: users.results || [],
      compliance: compliance.results || [],
      assessments: assessments.results || [],
      documents: documents.results || [],
      activity: activity.results || [],
      tickets: tickets.results || []
    });

  } catch (error) {
    console.error("Admin client detail error:", error);
    return errorResponse("Failed to fetch client data", 500);
  }
}

// POST - Add data to client (compliance, assessment, document)
export async function onRequestPost(context) {
  const db = context.env.DB;
  const { orgId } = context.params;
  
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
    // Verify org exists
    const org = await db.prepare(`SELECT id FROM organizations WHERE id = ?`).bind(orgId).first();
    if (!org) {
      return errorResponse("Organization not found", 404);
    }

    const body = await context.request.json();
    const { action } = body;

    switch (action) {
      // ============ COMPLIANCE PROGRAMS ============
      case "add_compliance": {
        const { framework, status, startDate, targetDate, auditorName, notes } = body;
        
        if (!framework) {
          return errorResponse("Framework is required", 400);
        }

        const id = generateId();
        const progress = status === 'certified' ? 100 : (status === 'in_progress' ? 50 : 0);

        await db.prepare(`
          INSERT INTO compliance_programs (id, organization_id, framework, status, progress, start_date, target_date, auditor_name, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, orgId, framework, status || 'not_started', progress, startDate || null, targetDate || null, auditorName || null, notes || null).run();

        // Log activity
        await db.prepare(`
          INSERT INTO activity_log (id, organization_id, action, resource_type, resource_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(generateId(), orgId, 'compliance_added', 'compliance', id, JSON.stringify({ framework, addedBy: session.email })).run();

        return jsonResponse({ success: true, id });
      }

      case "update_compliance": {
        const { complianceId, status, progress, notes, certificationDate } = body;
        
        if (!complianceId) {
          return errorResponse("Compliance ID required", 400);
        }

        await db.prepare(`
          UPDATE compliance_programs 
          SET status = COALESCE(?, status),
              progress = COALESCE(?, progress),
              notes = COALESCE(?, notes),
              certification_date = COALESCE(?, certification_date),
              updated_at = datetime('now')
          WHERE id = ? AND organization_id = ?
        `).bind(status || null, progress || null, notes || null, certificationDate || null, complianceId, orgId).run();

        return jsonResponse({ success: true });
      }

      // ============ ASSESSMENTS ============
      case "add_assessment": {
        const { type, title, status, scheduledDate, completedDate, findings, riskScore, reportUrl } = body;
        
        if (!type || !title) {
          return errorResponse("Type and title are required", 400);
        }

        const id = generateId();

        await db.prepare(`
          INSERT INTO assessments (id, organization_id, type, title, status, scheduled_date, completed_date, findings_summary, risk_score, report_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, orgId, type, title, status || 'scheduled', scheduledDate || null, completedDate || null, findings || null, riskScore || null, reportUrl || null).run();

        await db.prepare(`
          INSERT INTO activity_log (id, organization_id, action, resource_type, resource_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(generateId(), orgId, 'assessment_added', 'assessment', id, JSON.stringify({ type, title, addedBy: session.email })).run();

        return jsonResponse({ success: true, id });
      }

      case "update_assessment": {
        const { assessmentId, status, findings, riskScore, completedDate, reportUrl } = body;
        
        if (!assessmentId) {
          return errorResponse("Assessment ID required", 400);
        }

        await db.prepare(`
          UPDATE assessments 
          SET status = COALESCE(?, status),
              findings_summary = COALESCE(?, findings_summary),
              risk_score = COALESCE(?, risk_score),
              completed_date = COALESCE(?, completed_date),
              report_url = COALESCE(?, report_url),
              updated_at = datetime('now')
          WHERE id = ? AND organization_id = ?
        `).bind(status || null, findings || null, riskScore || null, completedDate || null, reportUrl || null, assessmentId, orgId).run();

        return jsonResponse({ success: true });
      }

      // ============ DOCUMENTS ============
      case "add_document": {
        const { name, type, category, description, url, fileSize } = body;
        
        if (!name || !url) {
          return errorResponse("Name and URL are required", 400);
        }

        const id = generateId();

        await db.prepare(`
          INSERT INTO documents (id, organization_id, name, type, category, description, url, file_size)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, orgId, name, type || 'report', category || 'general', description || null, url, fileSize || null).run();

        await db.prepare(`
          INSERT INTO activity_log (id, organization_id, action, resource_type, resource_id, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(generateId(), orgId, 'document_added', 'document', id, JSON.stringify({ name, addedBy: session.email })).run();

        return jsonResponse({ success: true, id });
      }

      case "delete_document": {
        const { documentId } = body;
        
        if (!documentId) {
          return errorResponse("Document ID required", 400);
        }

        await db.prepare(`DELETE FROM documents WHERE id = ? AND organization_id = ?`).bind(documentId, orgId).run();

        return jsonResponse({ success: true });
      }

      // ============ ORGANIZATION UPDATE ============
      case "update_organization": {
        const { name, domain, industry, subscriptionTier, status, notes } = body;

        await db.prepare(`
          UPDATE organizations 
          SET name = COALESCE(?, name),
              domain = COALESCE(?, domain),
              industry = COALESCE(?, industry),
              subscription_tier = COALESCE(?, subscription_tier),
              status = COALESCE(?, status),
              notes = COALESCE(?, notes),
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(name || null, domain || null, industry || null, subscriptionTier || null, status || null, notes || null, orgId).run();

        return jsonResponse({ success: true });
      }

      default:
        return errorResponse("Invalid action", 400);
    }

  } catch (error) {
    console.error("Admin client action error:", error);
    return errorResponse("Action failed: " + error.message, 500);
  }
}

// DELETE - Remove client data
export async function onRequestDelete(context) {
  const db = context.env.DB;
  const { orgId } = context.params;
  
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

  const url = new URL(context.request.url);
  const type = url.searchParams.get("type");
  const itemId = url.searchParams.get("id");

  if (!type || !itemId) {
    return errorResponse("Type and ID required", 400);
  }

  try {
    switch (type) {
      case "compliance":
        await db.prepare(`DELETE FROM compliance_programs WHERE id = ? AND organization_id = ?`).bind(itemId, orgId).run();
        break;
      case "assessment":
        await db.prepare(`DELETE FROM assessments WHERE id = ? AND organization_id = ?`).bind(itemId, orgId).run();
        break;
      case "document":
        await db.prepare(`DELETE FROM documents WHERE id = ? AND organization_id = ?`).bind(itemId, orgId).run();
        break;
      case "user":
        await db.prepare(`DELETE FROM users WHERE id = ? AND organization_id = ?`).bind(itemId, orgId).run();
        break;
      default:
        return errorResponse("Invalid type", 400);
    }

    return jsonResponse({ success: true });

  } catch (error) {
    console.error("Admin delete error:", error);
    return errorResponse("Delete failed: " + error.message, 500);
  }
}
