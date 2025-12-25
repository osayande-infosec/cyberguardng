// Admin Documents API - Upload and manage client documents
// Only accessible by platform admins

import { getAuthenticatedUser, isPlatformAdmin, generateId, logActivity, jsonResponse, errorResponse } from "../lib/db.js";

// GET - List all documents (optionally by organization)
export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const orgId = url.searchParams.get("organization_id");
  const category = url.searchParams.get("category");
  
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
    let query = `
      SELECT d.*, o.name as organization_name
      FROM documents d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE 1=1
    `;
    const params = [];

    if (orgId) {
      query += ` AND d.organization_id = ?`;
      params.push(orgId);
    }
    if (category) {
      query += ` AND d.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY d.created_at DESC`;

    const stmt = db.prepare(query);
    const documents = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    return jsonResponse({
      documents: documents.results || []
    });

  } catch (error) {
    console.error("Admin documents list error:", error);
    return errorResponse("Failed to fetch documents", 500);
  }
}

// POST - Create a new document record
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
    const { 
      organization_id, 
      category, 
      title, 
      description, 
      file_name, 
      file_url, 
      file_size,
      version,
      status 
    } = body;

    // Validate required fields
    if (!organization_id || !category || !title) {
      return errorResponse("organization_id, category, and title are required", 400);
    }

    // Verify organization exists
    const org = await db.prepare("SELECT id, name FROM organizations WHERE id = ?")
      .bind(organization_id).first();
    
    if (!org) {
      return errorResponse("Organization not found", 404);
    }

    const docId = generateId();
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO documents (
        id, organization_id, category, title, description, 
        file_name, file_url, file_size, version, status, 
        uploaded_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      docId,
      organization_id,
      category,
      title,
      description || null,
      file_name || null,
      file_url || null,
      file_size || null,
      version || '1.0',
      status || 'published',
      session.email,
      now,
      now
    ).run();

    // Log activity
    await logActivity(db, {
      organizationId: organization_id,
      userId: null,
      action: "document_uploaded",
      resourceType: "document",
      resourceId: docId,
      details: { title, category, uploadedBy: session.email },
      ipAddress: context.request.headers.get('CF-Connecting-IP')
    });

    return jsonResponse({ 
      success: true, 
      documentId: docId,
      message: `Document "${title}" added to ${org.name}`
    });

  } catch (error) {
    console.error("Admin document create error:", error);
    return errorResponse("Failed to create document: " + error.message, 500);
  }
}

// PUT - Update a document
export async function onRequestPut(context) {
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
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse("Document ID required", 400);
    }

    // Build update query dynamically
    const allowedFields = ['category', 'title', 'description', 'file_name', 'file_url', 'file_size', 'version', 'status'];
    const setters = [];
    const values = [];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setters.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (setters.length === 0) {
      return errorResponse("No valid fields to update", 400);
    }

    setters.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await db.prepare(`
      UPDATE documents SET ${setters.join(", ")} WHERE id = ?
    `).bind(...values).run();

    return jsonResponse({ 
      success: true, 
      message: "Document updated successfully"
    });

  } catch (error) {
    console.error("Admin document update error:", error);
    return errorResponse("Failed to update document: " + error.message, 500);
  }
}

// DELETE - Remove a document
export async function onRequestDelete(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const docId = url.searchParams.get("id");
  
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

  if (!docId) {
    return errorResponse("Document ID required", 400);
  }

  try {
    // Get document info for logging
    const doc = await db.prepare("SELECT * FROM documents WHERE id = ?")
      .bind(docId).first();

    if (!doc) {
      return errorResponse("Document not found", 404);
    }

    await db.prepare("DELETE FROM documents WHERE id = ?")
      .bind(docId).run();

    // Log activity
    await logActivity(db, {
      organizationId: doc.organization_id,
      userId: null,
      action: "document_deleted",
      resourceType: "document",
      resourceId: docId,
      details: { title: doc.title, deletedBy: session.email },
      ipAddress: context.request.headers.get('CF-Connecting-IP')
    });

    return jsonResponse({ 
      success: true, 
      message: `Document "${doc.title}" deleted`
    });

  } catch (error) {
    console.error("Admin document delete error:", error);
    return errorResponse("Failed to delete document: " + error.message, 500);
  }
}
