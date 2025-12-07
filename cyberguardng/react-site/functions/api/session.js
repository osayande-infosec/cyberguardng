// Session Management API (FREE)
// Tracks visitors and recognizes returning users

export async function onRequest(context) {
  const { request, env } = context;
  const { DB, KV } = env;
  
  try {
    const url = new URL(request.url);
    const method = request.method;

    // GET /api/session?visitor_id=xxx
    if (method === 'GET') {
      const visitorId = url.searchParams.get('visitor_id');
      
      if (!visitorId) {
        return new Response(JSON.stringify({ error: 'visitor_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check KV cache first (fast)
      const cached = await KV.get(`visitor:${visitorId}`, 'json');
      if (cached) {
        return new Response(JSON.stringify(cached), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Query D1 database
      const visitor = await DB.prepare(
        'SELECT * FROM visitors WHERE visitor_id = ?'
      ).bind(visitorId).first();

      if (visitor) {
        // Update last_seen and visit_count
        await DB.prepare(
          'UPDATE visitors SET last_seen = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE visitor_id = ?'
        ).bind(visitorId).run();

        visitor.visit_count += 1;
        visitor.is_returning = visitor.visit_count > 1;

        // Cache for 1 hour
        await KV.put(`visitor:${visitorId}`, JSON.stringify(visitor), { expirationTtl: 3600 });

        return new Response(JSON.stringify(visitor), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ is_new: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /api/session (create new visitor/session)
    if (method === 'POST') {
      const body = await request.json();
      const { visitor_id, user_agent, country, city } = body;

      if (!visitor_id) {
        return new Response(JSON.stringify({ error: 'visitor_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create or get visitor
      const existingVisitor = await DB.prepare(
        'SELECT * FROM visitors WHERE visitor_id = ?'
      ).bind(visitor_id).first();

      let visitor;
      if (existingVisitor) {
        // Update existing
        await DB.prepare(
          'UPDATE visitors SET last_seen = CURRENT_TIMESTAMP, visit_count = visit_count + 1 WHERE visitor_id = ?'
        ).bind(visitor_id).run();
        
        visitor = { ...existingVisitor, visit_count: existingVisitor.visit_count + 1 };
      } else {
        // Create new
        await DB.prepare(
          'INSERT INTO visitors (visitor_id, user_agent, country, city) VALUES (?, ?, ?, ?)'
        ).bind(visitor_id, user_agent, country, city).run();

        visitor = {
          visitor_id,
          user_agent,
          country,
          city,
          visit_count: 1,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString()
        };
      }

      // Create session
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await DB.prepare(
        'INSERT INTO sessions (session_id, visitor_id) VALUES (?, ?)'
      ).bind(sessionId, visitor_id).run();

      // Cache visitor data
      await KV.put(`visitor:${visitor_id}`, JSON.stringify(visitor), { expirationTtl: 3600 });

      // Track analytics event
      await DB.prepare(
        'INSERT INTO analytics_events (visitor_id, session_id, event_type, page_path) VALUES (?, ?, ?, ?)'
      ).bind(visitor_id, sessionId, 'page_view', '/').run();

      return new Response(JSON.stringify({
        session_id: sessionId,
        visitor,
        is_returning: visitor.visit_count > 1
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Session API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
