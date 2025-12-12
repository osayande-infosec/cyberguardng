export async function onRequestPost(context) {
  const { request } = context;

  try {
    const formData = await request.formData();
    const digits = formData.get("Digits");
    const HUMAN_AGENT_NUMBER = "+2348138699999"; // Update as needed

    let twiml = "";

    if (!digits) {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Welcome to Cyberguard Next Generation Security Inc. Press 1 to speak with a human agent, otherwise stay on the line to explore our services. How can I help you today?</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="5"/>\n  <Say voice="Polly.Joanna">You are now being assisted by our AI agent. How can I help you today?</Say>\n  <!-- Insert your AI <Connect> or <Start> logic here -->\n</Response>`;
    } else if (digits === "1") {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Connecting you to a human agent now.</Say>\n  <Dial>${HUMAN_AGENT_NUMBER}</Dial>\n</Response>`;
    } else {
      twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">You are now being assisted by our AI agent. How can I help you today?</Say>\n  <!-- Insert your AI <Connect> or <Start> logic here -->\n</Response>`;
    }

    return new Response(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });
  } catch (error) {
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Sorry, an error occurred. Please try again later.</Say>\n</Response>`;
    return new Response(errorTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" }
    });
  }
}
