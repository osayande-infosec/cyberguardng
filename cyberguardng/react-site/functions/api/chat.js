// Enhanced Chat Function with RAG, Analytics, and Lead Tracking
// Cloudflare Pages Function

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { DB, VECTORIZE, KV, env } = context;
    const OPENAI_API_KEY = env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const message = body.message || "";
    const history = Array.isArray(body.history) ? body.history : [];
    const sessionId = body.sessionId || crypto.randomUUID();

    console.log("Processing message:", message);

    // === 1. Get or Create Conversation ===
    let conversation = await DB.prepare(
      "SELECT * FROM conversations WHERE session_id = ?"
    ).bind(sessionId).first();

    if (!conversation) {
      const result = await DB.prepare(
        "INSERT INTO conversations (session_id) VALUES (?) RETURNING id"
      ).bind(sessionId).first();
      conversation = { id: result.id, session_id: sessionId };
    }

    // === 2. Save User Message ===
    await DB.prepare(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)"
    ).bind(conversation.id, "user", message).run();

    // === 3. RAG: Search Knowledge Base ===
    let relevantContext = "";
    
    try {
      // Generate embedding for user question
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: message,
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryVector = embeddingData.data[0].embedding;

        // Search vector database
        const vectorResults = await VECTORIZE.query(queryVector, {
          topK: 3,
          returnMetadata: true,
        });

        if (vectorResults.matches && vectorResults.matches.length > 0) {
          relevantContext = vectorResults.matches
            .map(match => `${match.metadata.title}: ${match.metadata.content}`)
            .join("\n\n");
          
          console.log("Found relevant context from knowledge base");
        }
      }
    } catch (error) {
      console.error("RAG search error:", error);
      // Continue without RAG if it fails
    }

    // === 4. Track Analytics ===
    await DB.prepare(
      "INSERT INTO analytics_events (event_type, conversation_id, data) VALUES (?, ?, ?)"
    ).bind("question_asked", conversation.id, JSON.stringify({ question: message })).run();

    // Update popular topics
    const topics = extractTopics(message);
    for (const topic of topics) {
      await DB.prepare(`
        INSERT INTO popular_topics (topic, question_count, last_asked) 
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(topic) DO UPDATE SET 
          question_count = question_count + 1,
          last_asked = CURRENT_TIMESTAMP
      `).bind(topic).run();
    }

    // === 5. Build AI Prompt with Context ===
    const messages = [];
    
    let systemPrompt = 
      "You are Yande, the CyberGuardNG assistant. You help clients with cybersecurity inquiries, compliance questions, and consultation bookings.\n\n" +
      "When users ask about booking a consultation, scheduling a meeting, speaking with sales, or getting in touch:\n" +
      "Respond with: 'I'd be happy to help you schedule a consultation! [SHOW_CONTACT_FORM] Please fill out the form below, and a member of our sales team will contact you shortly.'\n\n" +
      "IMPORTANT: Include [SHOW_CONTACT_FORM] exactly as shown above when handling booking requests.\n\n";

    if (relevantContext) {
      systemPrompt += `\n\nRELEVANT COMPANY INFORMATION:\n${relevantContext}\n\n` +
        "Use the above information to answer questions accurately. If the information doesn't cover the question, provide general cybersecurity guidance and suggest contacting sales for specifics.\n\n";
    }

    systemPrompt += "For other questions, provide helpful, concise, security-focused answers about CyberGuardNG's services, compliance frameworks (SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, NIST, FedRAMP, CMMC), and cybersecurity best practices.";

    messages.push({ role: "system", content: systemPrompt });

    // Add conversation history
    history.forEach((h) => {
      messages.push({ role: h.role || "user", content: h.content || "" });
    });

    messages.push({ role: "user", content: message });

    // === 6. Call OpenAI ===
    console.log("Calling OpenAI API with RAG context");

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OpenAI error:", text);
      throw new Error(`OpenAI API error: ${resp.status}`);
    }

    const data = await resp.json();
    let reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response right now.";

    // === 7. Save Assistant Response ===
    await DB.prepare(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)"
    ).bind(conversation.id, "assistant", reply).run();

    // === 8. Calculate Lead Score ===
    const leadScore = calculateLeadScore(message, reply, history.length);
    
    // Cache session data in KV
    await KV.put(`session:${sessionId}`, JSON.stringify({
      conversationId: conversation.id,
      leadScore,
      lastActivity: new Date().toISOString(),
      messageCount: history.length + 1,
    }), { expirationTtl: 86400 }); // 24 hours

    console.log("Response generated successfully with RAG context");

    return new Response(JSON.stringify({ 
      reply,
      sessionId,
      contextUsed: !!relevantContext,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Chat function error:", err);
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Helper: Extract topics from message
function extractTopics(message) {
  const lowerMessage = message.toLowerCase();
  const topics = [];
  
  const topicKeywords = {
    'soc2': ['soc 2', 'soc2', 'soc-2'],
    'iso27001': ['iso 27001', 'iso27001', 'iso-27001'],
    'gdpr': ['gdpr', 'privacy', 'data protection'],
    'hipaa': ['hipaa', 'healthcare', 'phi'],
    'pentest': ['penetration test', 'pentest', 'security test'],
    'pricing': ['price', 'cost', 'quote', 'pricing'],
    'booking': ['book', 'schedule', 'appointment', 'consultation'],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
}

// Helper: Calculate lead score based on engagement
function calculateLeadScore(message, reply, historyLength) {
  let score = 0;
  
  // Message count indicates interest
  score += Math.min(historyLength * 10, 40);
  
  // Specific service inquiries
  if (/(soc|iso|gdpr|hipaa|compliance)/i.test(message)) score += 20;
  if (/(price|cost|quote)/i.test(message)) score += 15;
  if (/(book|schedule|consultation)/i.test(message)) score += 25;
  
  // Form shown
  if (reply.includes('[SHOW_CONTACT_FORM]')) score += 20;
  
  return Math.min(score, 100);
}
