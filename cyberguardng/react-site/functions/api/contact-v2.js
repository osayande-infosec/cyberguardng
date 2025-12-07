// Enhanced Contact/Lead API with Analytics (FREE)

export async function onRequestPost(context) {
  const { request, env } = context;
  const { DB, WEB3FORMS_ACCESS_KEY } = env;

  try {
    const body = await request.json();
    const { name, email, company, message, visitor_id, session_id, source = 'contact_form' } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save lead to database
    const result = await DB.prepare(`
      INSERT INTO leads (visitor_id, session_id, name, email, company, message, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(visitor_id, session_id, name, email, company, message, source).run();

    const leadId = result.meta.last_row_id;

    // Update session if exists
    if (session_id) {
      await DB.prepare(
        'UPDATE sessions SET form_submitted = 1 WHERE session_id = ?'
      ).bind(session_id).run();
    }

    // Track analytics
    if (visitor_id && session_id) {
      await DB.prepare(
        'INSERT INTO analytics_events (visitor_id, session_id, event_type, event_data) VALUES (?, ?, ?, ?)'
      ).bind(
        visitor_id,
        session_id,
        'form_submit',
        JSON.stringify({ source, has_company: !!company })
      ).run();
    }

    // Send email via Web3Forms
    if (WEB3FORMS_ACCESS_KEY) {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('company', company || 'Not provided');
      formData.append('message', message);
      formData.append('subject', `New Lead #${leadId} from CyberGuardNG ${source === 'chat' ? '(via Yande)' : ''}`);

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
    }

    return new Response(JSON.stringify({
      success: true,
      lead_id: leadId,
      message: 'Thank you! We\'ll contact you shortly.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
