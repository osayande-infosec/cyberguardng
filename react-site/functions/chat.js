// Cloudflare Pages Function
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const OPENAI_API_KEY = context.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const message = body.message || "";
    const history = Array.isArray(body.history) ? body.history : [];

    // Build messages for OpenAI Chat API
    const messages = [];
    messages.push({
      role: "system",
      content:
        "You are Yande, the CyberGuardNG assistant. Be helpful, concise and security-focused. Answer user questions about cyber security services, compliance, and booking consultations. If a question requires human assistance, suggest contacting support.",
    });

    history.forEach((h) => {
      messages.push({ role: h.role || "user", content: h.content || "" });
    });

    messages.push({ role: "user", content: message });

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
      return new Response(JSON.stringify({ error: text }), {
        status: resp.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response right now.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
