// Simple Analytics Dashboard API (FREE)
// Shows basic metrics from D1 database

export async function onRequestGet(context) {
  const { env } = context;
  const { DB } = env;

  try {
    const url = new URL(context.request.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoff = cutoffDate.toISOString();

    // Get total visitors
    const totalVisitors = await DB.prepare(
      'SELECT COUNT(*) as count FROM visitors WHERE first_seen >= ?'
    ).bind(cutoff).first();

    // Get total sessions
    const totalSessions = await DB.prepare(
      'SELECT COUNT(*) as count FROM sessions WHERE started_at >= ?'
    ).bind(cutoff).first();

    // Get total chat messages
    const totalMessages = await DB.prepare(
      'SELECT COUNT(*) as count FROM chat_messages WHERE created_at >= ?'
    ).bind(cutoff).first();

    // Get total leads
    const totalLeads = await DB.prepare(
      'SELECT COUNT(*) as count FROM leads WHERE created_at >= ?'
    ).bind(cutoff).first();

    // Get returning visitors
    const returningVisitors = await DB.prepare(
      'SELECT COUNT(*) as count FROM visitors WHERE visit_count > 1 AND last_seen >= ?'
    ).bind(cutoff).first();

    // Get sessions with chat
    const sessionsWithChat = await DB.prepare(
      'SELECT COUNT(*) as count FROM sessions WHERE chat_opened = 1 AND started_at >= ?'
    ).bind(cutoff).first();

    // Get sessions with forms
    const sessionsWithForms = await DB.prepare(
      'SELECT COUNT(*) as count FROM sessions WHERE form_submitted = 1 AND started_at >= ?'
    ).bind(cutoff).first();

    // Get top events
    const topEvents = await DB.prepare(`
      SELECT event_type, COUNT(*) as count 
      FROM analytics_events 
      WHERE created_at >= ?
      GROUP BY event_type 
      ORDER BY count DESC 
      LIMIT 10
    `).bind(cutoff).all();

    // Get recent leads
    const recentLeads = await DB.prepare(`
      SELECT name, email, company, source, created_at 
      FROM leads 
      WHERE created_at >= ?
      ORDER BY created_at DESC 
      LIMIT 10
    `).bind(cutoff).all();

    // Calculate conversion rate
    const conversionRate = totalSessions.count > 0 
      ? ((totalLeads.count / totalSessions.count) * 100).toFixed(2)
      : 0;

    return new Response(JSON.stringify({
      period_days: days,
      metrics: {
        total_visitors: totalVisitors.count,
        total_sessions: totalSessions.count,
        returning_visitors: returningVisitors.count,
        total_messages: totalMessages.count,
        total_leads: totalLeads.count,
        sessions_with_chat: sessionsWithChat.count,
        sessions_with_forms: sessionsWithForms.count,
        conversion_rate: `${conversionRate}%`
      },
      top_events: topEvents.results || [],
      recent_leads: recentLeads.results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
