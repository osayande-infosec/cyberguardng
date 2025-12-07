// Enhanced Chat API with Session History (FREE - no vectors)
// Remembers conversations and welcomes back returning visitors

export async function onRequestPost(context) {
  const { request, env } = context;
  const { DB, KV, OPENAI_API_KEY } = env;

  try {
    const body = await request.json();
    const { message, visitor_id, session_id } = body;

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get visitor info (check if returning)
    let visitor = null;
    let isReturning = false;
    if (visitor_id) {
      visitor = await DB.prepare(
        'SELECT * FROM visitors WHERE visitor_id = ?'
      ).bind(visitor_id).first();
      isReturning = visitor && visitor.visit_count > 1;
    }

    // Get chat history for this session
    let history = [];
    if (session_id) {
      const messages = await DB.prepare(
        'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'
      ).bind(session_id).all();
      history = messages.results || [];
    }

    // Search knowledge base (simple keyword search - no vectors needed)
    const keywords = message.toLowerCase();
    let contextDocs = [];
    
    const knowledgeResults = await DB.prepare(`
      SELECT title, content FROM knowledge_content 
      WHERE keywords LIKE ? OR content LIKE ? OR title LIKE ?
      LIMIT 3
    `).bind(`%${keywords}%`, `%${keywords}%`, `%${keywords}%`).all();

    if (knowledgeResults.results && knowledgeResults.results.length > 0) {
      contextDocs = knowledgeResults.results;
    }

    // Build system prompt
    let systemPrompt = "You are Yande, the CyberGuardNG assistant. You help clients with cybersecurity inquiries, compliance questions, and consultation bookings.\n\n";

    // Add returning visitor greeting
    if (isReturning && history.length === 0) {
      systemPrompt += `🎉 This visitor is returning! Welcome them back warmly (e.g., "Welcome back! It's great to see you again.").\n\n`;
    }

    // Add knowledge base context
    if (contextDocs.length > 0) {
      systemPrompt += "COMPANY KNOWLEDGE BASE:\n";
      contextDocs.forEach(doc => {
        systemPrompt += `- ${doc.title}: ${doc.content}\n`;
      });
      systemPrompt += "\n";
    } else {
      // Fallback info if no docs found
      systemPrompt += `COMPANY INFO:
- Services: SOC 2 Type I & II, ISO 27001, GDPR compliance, HIPAA, PCI DSS, NIST CSF, FedRAMP, CMMC
- Timeline: SOC 2 typically 3-6 months, ISO 27001 6-12 months
- Approach: Gap assessment → remediation → audit → certification
- Pricing: Starts at $25k for startups, $50k+ for enterprise (varies by scope)
- Industries: SaaS, healthcare, fintech, government contractors
- Differentiator: End-to-end support from pre-audit to maintenance

`;
    }

    systemPrompt += `When users ask about booking a consultation, scheduling a meeting, speaking with sales, or getting in touch:
Respond with: 'I'd be happy to help you schedule a consultation! [SHOW_CONTACT_FORM] Please fill out the form below, and a member of our sales team will contact you shortly.'

IMPORTANT: Include [SHOW_CONTACT_FORM] exactly as shown above when handling booking requests.

For other questions, provide helpful, concise, security-focused answers using the knowledge base above.`;

    // Build messages array
    const messages = [{ role: 'system', content: systemPrompt }];

    // Add conversation history
    history.forEach(h => {
      messages.push({ role: h.role, content: h.content });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || 
                  "I couldn't generate a response right now.";

    // Save messages to database
    if (session_id && visitor_id) {
      // Save user message
      await DB.prepare(
        'INSERT INTO chat_messages (session_id, visitor_id, role, content) VALUES (?, ?, ?, ?)'
      ).bind(session_id, visitor_id, 'user', message).run();

      // Save assistant message
      await DB.prepare(
        'INSERT INTO chat_messages (session_id, visitor_id, role, content) VALUES (?, ?, ?, ?)'
      ).bind(session_id, visitor_id, 'assistant', reply).run();

      // Update session activity
      await DB.prepare(
        'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP, chat_opened = 1 WHERE session_id = ?'
      ).bind(session_id).run();

      // Track analytics
      await DB.prepare(
        'INSERT INTO analytics_events (visitor_id, session_id, event_type, event_data) VALUES (?, ?, ?, ?)'
      ).bind(visitor_id, session_id, 'chat_message', JSON.stringify({ message_length: message.length })).run();
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
