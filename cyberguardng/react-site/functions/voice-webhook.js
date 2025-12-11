export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/voice-webhook") {
      return new Response("Not found", { status: 404 });
    }

    // Parse Twilio's POST body (x-www-form-urlencoded)
    const formData = await request.formData();
    const digits = formData.get("Digits");

    // Human agent phone number (replace with your real number)
    const HUMAN_AGENT_NUMBER = "+2348138699999"; // Update as needed

    let twiml = "";

    if (!digits) {
      // First interaction: Greet and ask for input
      twiml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n  <Say voice=\"Polly.Joanna\">Welcome to CyberGuardNG. Press 1 to speak with a human agent, or stay on the line to talk to our AI assistant.</Say>\n  <Gather numDigits=\"1\" action=\"/voice-webhook\" method=\"POST\" timeout=\"5\"/>\n</Response>`;
    } else if (digits === "1") {
      // Connect to human agent
      twiml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n  <Say voice=\"Polly.Joanna\">Connecting you to a human agent now.</Say>\n  <Dial>${HUMAN_AGENT_NUMBER}</Dial>\n</Response>`;
    } else {
      // Any other input: connect to AI assistant (replace with your AI logic or <Say> for demo)
      twiml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Response>\n  <Say voice=\"Polly.Joanna\">You are now being assisted by our AI agent. How can I help you today?</Say>\n  <!-- Insert your AI <Connect> or <Start> logic here -->\n</Response>`;
    }

    return new Response(twiml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml"
      }
    });
  }
};
