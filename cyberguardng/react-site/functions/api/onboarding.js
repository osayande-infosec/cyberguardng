// Onboarding API - Handle client registration requests
// Public endpoint for new users to request access

import { generateId, jsonResponse, errorResponse } from "../lib/db.js";

// POST - Submit onboarding request
export async function onRequestPost(context) {
  const db = context.env.DB;
  
  if (!db) {
    return errorResponse("Database not configured", 500);
  }

  try {
    const body = await context.request.json();
    const { 
      companyName, 
      industry, 
      contactName, 
      contactEmail, 
      contactPhone,
      companySize,
      servicesInterested,
      message 
    } = body;

    // Validation
    if (!companyName || !contactName || !contactEmail) {
      return errorResponse("Company name, contact name, and email are required", 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return errorResponse("Invalid email address", 400);
    }

    // Check if email already exists
    const existingUser = await db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(contactEmail).first();

    if (existingUser) {
      return errorResponse("An account with this email already exists. Please sign in.", 400);
    }

    // Check if there's already a pending request
    const existingRequest = await db.prepare(`
      SELECT id FROM onboarding_requests WHERE email = ? AND status = 'pending'
    `).bind(contactEmail).first();

    if (existingRequest) {
      return errorResponse("You already have a pending request. We'll contact you soon.", 400);
    }

    // Create onboarding request
    const requestId = generateId();
    
    await db.prepare(`
      INSERT INTO onboarding_requests (
        id, company_name, industry, contact_name, email, phone,
        company_size, services_interested, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      requestId,
      companyName,
      industry || null,
      contactName,
      contactEmail,
      contactPhone || null,
      companySize || null,
      servicesInterested ? JSON.stringify(servicesInterested) : null,
      message || null
    ).run();

    // Log the request
    await db.prepare(`
      INSERT INTO activity_log (id, organization_id, user_id, action, resource_type, resource_id, details)
      VALUES (?, NULL, NULL, 'onboarding_request', 'onboarding', ?, ?)
    `).bind(
      generateId(),
      requestId,
      JSON.stringify({ companyName, contactEmail })
    ).run();

    return jsonResponse({ 
      success: true, 
      message: "Your request has been submitted. We'll contact you within 1-2 business days.",
      requestId 
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    return errorResponse("Failed to submit request: " + error.message, 500);
  }
}

// GET - Get request status (for users to check their status)
export async function onRequestGet(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const email = url.searchParams.get("email");
  
  if (!db) {
    return errorResponse("Database not configured", 500);
  }

  if (!email) {
    return errorResponse("Email required", 400);
  }

  try {
    const request = await db.prepare(`
      SELECT id, company_name, status, created_at 
      FROM onboarding_requests 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(email).first();

    if (!request) {
      return jsonResponse({ found: false });
    }

    return jsonResponse({ 
      found: true,
      status: request.status,
      companyName: request.company_name,
      submittedAt: request.created_at
    });

  } catch (error) {
    console.error("Status check error:", error);
    return errorResponse("Failed to check status", 500);
  }
}
