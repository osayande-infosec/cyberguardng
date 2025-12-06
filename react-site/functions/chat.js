// Cloudflare Pages Function
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const OPENAI_API_KEY = context.env.OPENAI_API_KEY;

    // Log for debugging (will show in Cloudflare logs, not to user)
    console.log("API Key present:", !!OPENAI_API_KEY);
    console.log("API Key length:", OPENAI_API_KEY?.length);

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured in environment variables" }),
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
        "You are Yande, the CyberGuardNG assistant. You help clients with cybersecurity inquiries, compliance questions, and consultation bookings.\n\n" +
        "When users ask about booking a consultation, scheduling a meeting, speaking with sales, or getting in touch:\n" +
        "Respond with: 'I'd be happy to help you schedule a consultation! [SHOW_CONTACT_FORM] Please fill out the form below, and a member of our sales team will contact you shortly.'\n\n" +
        "IMPORTANT: Include [SHOW_CONTACT_FORM] exactly as shown above when handling booking requests.\n\n" +
        "For other questions, provide helpful, concise, security-focused answers about CyberGuardNG's services, compliance frameworks (SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, NIST, FedRAMP, CMMC), and cybersecurity best practices.",
    });

    history.forEach((h) => {
      messages.push({ role: h.role || "user", content: h.content || "" });
    });

    messages.push({ role: "user", content: message });

    console.log("Calling OpenAI API...");

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

    console.log("OpenAI response status:", resp.status);

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OpenAI error response:", text);
      
      // Return more specific error to help debug
      let errorMessage = "OpenAI API error";
      if (resp.status === 401) {
        errorMessage = "Invalid OpenAI API key (401 Unauthorized)";
      } else if (resp.status === 429) {
        errorMessage = "OpenAI rate limit exceeded or insufficient quota (429)";
      } else if (resp.status === 400) {
        errorMessage = "Bad request to OpenAI API (400)";
      }
      
      return new Response(
        JSON.stringify({ error: `${errorMessage}: ${text.substring(0, 200)}` }),
        { status: resp.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I couldn't generate a response right now.";

    console.log("Reply generated successfully");

    return new Response(JSON.stringify({ reply }), {
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
