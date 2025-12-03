const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
    };
  }

  const message = body.message || "";
  const history = Array.isArray(body.history) ? body.history : [];

  // Build messages for OpenAI Chat API
  const messages = [];
  // system prompt to set assistant behaviour
  messages.push({
    role: "system",
    content:
      "You are Yande, the CyberGuardNG assistant. Be helpful, concise and security-focused. Answer user questions about cyber security services, compliance, and booking consultations. If a question requires human assistance, suggest contacting support.",
  });

  // append history
  history.forEach((h) => {
    messages.push({ role: h.role || "user", content: h.content || "" });
  });

  // current user message
  messages.push({ role: "user", content: message });

  try {
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
      return { statusCode: resp.status, body: JSON.stringify({ error: text }) };
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response right now.";

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
