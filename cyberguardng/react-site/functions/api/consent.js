// Cookie Consent Tracking API (FREE)
// GDPR-compliant consent management

export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;

  try {
    const method = request.method;

    // POST /api/consent - Save consent preferences
    if (method === 'POST') {
      const body = await request.json();
      const {
        visitor_id,
        analytics_consent = false,
        marketing_consent = false,
        preferences_consent = false
      } = body;

      if (!visitor_id) {
        return new Response(JSON.stringify({ error: 'visitor_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get IP and user agent
      const ip_address = request.headers.get('CF-Connecting-IP') || 'unknown';
      const user_agent = request.headers.get('User-Agent') || 'unknown';

      // Save consent
      await DB.prepare(`
        INSERT INTO cookie_consents 
        (visitor_id, analytics_consent, marketing_consent, preferences_consent, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        visitor_id,
        analytics_consent ? 1 : 0,
        marketing_consent ? 1 : 0,
        preferences_consent ? 1 : 0,
        ip_address,
        user_agent
      ).run();

      // Track analytics event
      await DB.prepare(
        'INSERT INTO analytics_events (visitor_id, event_type, event_data) VALUES (?, ?, ?)'
      ).bind(
        visitor_id,
        'consent_given',
        JSON.stringify({ analytics_consent, marketing_consent, preferences_consent })
      ).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Consent preferences saved'
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET /api/consent?visitor_id=xxx - Get consent status
    if (method === 'GET') {
      const url = new URL(request.url);
      const visitor_id = url.searchParams.get('visitor_id');

      if (!visitor_id) {
        return new Response(JSON.stringify({ error: 'visitor_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const consent = await DB.prepare(
        'SELECT * FROM cookie_consents WHERE visitor_id = ? ORDER BY consented_at DESC LIMIT 1'
      ).bind(visitor_id).first();

      if (consent) {
        return new Response(JSON.stringify({
          has_consent: true,
          analytics: !!consent.analytics_consent,
          marketing: !!consent.marketing_consent,
          preferences: !!consent.preferences_consent,
          consented_at: consent.consented_at
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ has_consent: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Consent API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
