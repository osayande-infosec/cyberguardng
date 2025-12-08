/**
 * Twilio Voice Webhook Handler
 * Receives incoming calls and streams audio to OpenAI Realtime API
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse Twilio's form data
    const formData = await request.formData();
    const callSid = formData.get('CallSid');
    const from = formData.get('From');
    const to = formData.get('To');
    
    console.log(`Incoming call: ${callSid} from ${from} to ${to}`);
    
    // Generate TwiML response with Media Stream
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to CyberGuard N G Security. Please hold while we connect you to our AI assistant.</Say>
  <Connect>
    <Stream url="wss://${new URL(request.url).host}/voice-stream">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Connect>
</Response>`;
    
    return new Response(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Voice webhook error:', error);
    
    // Fallback TwiML for errors
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're experiencing technical difficulties. Please try again later or email us at sales@cyberguardng.ca</Say>
  <Hangup />
</Response>`;
    
    return new Response(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
