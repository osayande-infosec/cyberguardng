// Lead Management & Contact Form API
// POST /api/contact - Create lead and send email

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { DB, KV, env } = context;
    const { name, email, company, message, sessionId } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get lead score from session if available
    let leadScore = 0;
    let conversationId = null;
    
    if (sessionId) {
      const sessionData = await KV.get(`session:${sessionId}`, "json");
      if (sessionData) {
        leadScore = sessionData.leadScore || 0;
        conversationId = sessionData.conversationId;
      }
    }

    // Create or update lead
    const existingLead = await DB.prepare(
      "SELECT * FROM leads WHERE email = ?"
    ).bind(email).first();

    let leadId;
    if (existingLead) {
      // Update existing lead
      await DB.prepare(`
        UPDATE leads 
        SET name = ?, company = ?, message = ?, 
            lead_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(name, company || '', message, leadScore, existingLead.id).run();
      leadId = existingLead.id;
    } else {
      // Create new lead
      const result = await DB.prepare(`
        INSERT INTO leads (name, email, company, message, source, lead_score)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id
      `).bind(name, email, company || '', message, 'chatbot', leadScore).first();
      leadId = result.id;
    }

    // Link conversation to lead if session exists
    if (conversationId) {
      await DB.prepare(
        "UPDATE conversations SET lead_id = ? WHERE id = ?"
      ).bind(leadId, conversationId).run();
    }

    // Track analytics
    await DB.prepare(`
      INSERT INTO analytics_events (event_type, conversation_id, data)
      VALUES (?, ?, ?)
    `).bind(
      'form_submitted',
      conversationId,
      JSON.stringify({ leadId, email, leadScore })
    ).run();

    // Send email via Web3Forms
    const formData = new FormData();
    formData.append("access_key", env.WEB3FORMS_ACCESS_KEY || "deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783");
    formData.append("name", name);
    formData.append("email", email);
    formData.append("company", company || "Not provided");
    formData.append("message", message);
    formData.append("subject", `New Lead: ${name} (Score: ${leadScore}) - via Yande`);
    formData.append("lead_score", leadScore.toString());

    const emailResponse = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const emailResult = await emailResponse.json();

    if (!emailResult.success) {
      console.error("Email send failed:", emailResult);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! A member of our sales team will contact you shortly.",
        leadId,
        leadScore,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET /api/contact - Retrieve leads (for admin)
export async function onRequestGet(context) {
  try {
    const { DB } = context;
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status') || 'new';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const leads = await DB.prepare(`
      SELECT id, name, email, company, message, source, status, lead_score, created_at
      FROM leads 
      WHERE status = ?
      ORDER BY lead_score DESC, created_at DESC
      LIMIT ?
    `).bind(status, limit).all();

    return new Response(
      JSON.stringify({ leads: leads.results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Get leads error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
