// Analytics & Insights API
// GET /api/analytics - Dashboard data

export async function onRequestGet(context) {
  try {
    const { DB } = context;
    const url = new URL(context.request.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    // Popular topics
    const popularTopics = await DB.prepare(`
      SELECT topic, question_count, last_asked
      FROM popular_topics
      ORDER BY question_count DESC
      LIMIT 10
    `).all();

    // Lead conversion stats
    const leadStats = await DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(lead_score) as avg_score
      FROM leads
      WHERE created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY status
    `).bind(days).all();

    // Daily message volume
    const messageVolume = await DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM messages
      WHERE created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).bind(days).all();

    // Top questions (sample of recent)
    const recentQuestions = await DB.prepare(`
      SELECT m.content, m.created_at
      FROM messages m
      WHERE m.role = 'user' AND m.created_at >= datetime('now', '-7 days')
      ORDER BY m.created_at DESC
      LIMIT 20
    `).all();

    // Conversion funnel
    const funnelStats = await DB.prepare(`
      SELECT 
        SUM(CASE WHEN event_type = 'question_asked' THEN 1 ELSE 0 END) as questions,
        SUM(CASE WHEN event_type = 'form_shown' THEN 1 ELSE 0 END) as forms_shown,
        SUM(CASE WHEN event_type = 'form_submitted' THEN 1 ELSE 0 END) as forms_submitted
      FROM analytics_events
      WHERE created_at >= datetime('now', '-' || ? || ' days')
    `).bind(days).first();

    return new Response(
      JSON.stringify({
        period: `${days} days`,
        popularTopics: popularTopics.results,
        leadStats: leadStats.results,
        messageVolume: messageVolume.results,
        recentQuestions: recentQuestions.results,
        conversionFunnel: {
          questions: funnelStats.questions || 0,
          formsShown: funnelStats.forms_shown || 0,
          formsSubmitted: funnelStats.forms_submitted || 0,
          conversionRate: funnelStats.questions > 0 
            ? ((funnelStats.forms_submitted / funnelStats.questions) * 100).toFixed(2)
            : 0
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Analytics API error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
