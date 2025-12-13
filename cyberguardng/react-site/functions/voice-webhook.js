

export async function onRequestPost(context) {
  const { request } = context;
  // Set your business hours (0=Sunday, 1=Monday, ..., 6=Saturday)
  const BUSINESS_START = 9; // 9 AM
  const BUSINESS_END = 17; // 5 PM
  const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri
  const HUMAN_AGENT_NUMBER = "+14379084824";

  function isBusinessHours() {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    // Adjust for your timezone if needed (e.g., UTC-5 for EST)
    const localHour = hour - 5; // EST (adjust as needed)
    return BUSINESS_DAYS.includes(day) && localHour >= BUSINESS_START && localHour < BUSINESS_END;
  }

  try {
    const formData = await request.formData();
    const digits = formData.get("Digits");
    const recordingUrl = formData.get("RecordingUrl");
    let twiml = "";
    // Helper: Send email with MailChannels
    async function sendVoicemailEmail(recordingUrl, fromNumber) {
      const mailData = {
        personalizations: [
          { to: [{ email: 'sales@cyberguardng.ca' }] }
        ],
        from: { email: 'voicemail@cyberguardng.ca', name: 'CyberGuardNG IVR' },
        subject: 'New Voicemail from CyberGuardNG IVR',
        content: [
          {
            type: 'text/html',
            value:
              `<p>You have received a new voicemail.</p>` +
              `<p><b>From:</b> ${fromNumber || 'Unknown'}</p>` +
              `<p><a href="${recordingUrl}">Listen to Voicemail</a></p>`
          }
        ]
      };
      try {
        await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mailData)
        });
      } catch (e) {
        // Optionally log error
      }
    }

    if (recordingUrl) {
      // Send voicemail email (async, fire and forget)
      sendVoicemailEmail(recordingUrl, formData.get("From"));
    }

    if (isBusinessHours()) {
      // BUSINESS HOURS
      if (!digits) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Welcome to CyberGuard Next Generation Security Inc.</Say>\n  <Say voice="Polly.Joanna">If you’d like to speak with a security specialist, press 1 now.</Say>\n  <Say voice="Polly.Joanna">To hear about our services, press 2.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="7"/>\n  <Say voice="Polly.Joanna">No input received. Here is a quick overview of our services.</Say>\n  <Redirect method="POST">/voice-webhook?Digits=2</Redirect>\n</Response>`;
      } else if (digits === "1") {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Please hold while we connect you to a member of our team.</Say>\n  <Dial>${HUMAN_AGENT_NUMBER}</Dial>\n</Response>`;
      } else if (digits === "2") {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Thanks for staying on the line.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">At CyberGuard Next Generation Security, we help growing businesses protect their systems, meet compliance requirements, and stay prepared for audits and security incidents.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Our services include managed security monitoring, cloud security assessments across AWS, Azure, and Google Cloud, and practical support for frameworks such as SOC 2, ISO 27001, and HIPAA.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">We also help organizations manage vendor risk, develop clear security policies, and respond quickly when incidents occur.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Whether you’re preparing for your first audit or strengthening an existing security program, our team focuses on clear guidance, practical implementation, and ongoing support.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">In just a moment, we’ll continue assisting you. If at any time you’d like to speak with a security specialist, you can press 1.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="10">\n    <Say voice="Polly.Joanna">To speak with a security specialist, press 1 now.</Say>\n  </Gather>\n  <Say voice="Polly.Joanna">Thank you for your interest in CyberGuard Next Generation Security. Goodbye!</Say>\n  <Hangup/>\n</Response>`;
      } else {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Thanks for staying on the line.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">At CyberGuard Next Generation Security, we help growing businesses protect their systems, meet compliance requirements, and stay prepared for audits and security incidents.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Our services include managed security monitoring, cloud security assessments across AWS, Azure, and Google Cloud, and practical support for frameworks such as SOC 2, ISO 27001, and HIPAA.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">We also help organizations manage vendor risk, develop clear security policies, and respond quickly when incidents occur.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Whether you’re preparing for your first audit or strengthening an existing security program, our team focuses on clear guidance, practical implementation, and ongoing support.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">In just a moment, we’ll continue assisting you. If at any time you’d like to speak with a security specialist, you can press 1.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="10">\n    <Say voice="Polly.Joanna">To speak with a security specialist, press 1 now.</Say>\n  </Gather>\n  <Say voice="Polly.Joanna">Thank you for your interest in CyberGuard Next Generation Security. Goodbye!</Say>\n  <Hangup/>\n</Response>`;
      }
    } else {
      // AFTER HOURS
      if (!digits && !recordingUrl) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Welcome to CyberGuard Next Generation Security Inc.</Say>\n  <Say voice="Polly.Joanna">Our office is currently closed, but support is still available.</Say>\n  <Say voice="Polly.Joanna">If you’d like to leave a message for our team, press 1 now.</Say>\n  <Say voice="Polly.Joanna">To hear about our services, press 2.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="7"/>\n  <Say voice="Polly.Joanna">No input received. Here is a quick overview of our services.</Say>\n  <Redirect method="POST">/voice-webhook?Digits=2</Redirect>\n</Response>`;
      } else if (digits === "1" && !recordingUrl) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Please leave your name, number, and a brief message after the beep. Our team will get back to you as soon as possible.</Say>\n  <Record maxLength="60" action="/voice-webhook" method="POST" />\n</Response>`;
      } else if (digits === "2") {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Thanks for staying on the line.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">At CyberGuard Next Generation Security, we help growing businesses protect their systems, meet compliance requirements, and stay prepared for audits and security incidents.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Our services include managed security monitoring, cloud security assessments across AWS, Azure, and Google Cloud, and practical support for frameworks such as SOC 2, ISO 27001, and HIPAA.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">We also help organizations manage vendor risk, develop clear security policies, and respond quickly when incidents occur.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Whether you’re preparing for your first audit or strengthening an existing security program, our team focuses on clear guidance, practical implementation, and ongoing support.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">In just a moment, we’ll continue assisting you. If at any time you’d like to leave a message for our team, you can press 1.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="10">\n    <Say voice="Polly.Joanna">To leave a message, press 1 now.</Say>\n  </Gather>\n  <Say voice="Polly.Joanna">Thank you for your interest in CyberGuard Next Generation Security. Goodbye!</Say>\n  <Hangup/>\n</Response>`;
      } else if (recordingUrl) {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Thank you for your message. Our team will contact you soon. Goodbye!</Say>\n  <Hangup/>
</Response>`;
      } else {
        twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">Thanks for staying on the line.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">At CyberGuard Next Generation Security, we help growing businesses protect their systems, meet compliance requirements, and stay prepared for audits and security incidents.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Our services include managed security monitoring, cloud security assessments across AWS, Azure, and Google Cloud, and practical support for frameworks such as SOC 2, ISO 27001, and HIPAA.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">We also help organizations manage vendor risk, develop clear security policies, and respond quickly when incidents occur.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">Whether you’re preparing for your first audit or strengthening an existing security program, our team focuses on clear guidance, practical implementation, and ongoing support.</Say>\n  <Pause length="1"/>\n  <Say voice="Polly.Joanna">In just a moment, we’ll continue assisting you. If at any time you’d like to leave a message for our team, you can press 1.</Say>\n  <Gather numDigits="1" action="/voice-webhook" method="POST" timeout="10">\n    <Say voice="Polly.Joanna">To leave a message, press 1 now.</Say>\n  </Gather>\n  <Say voice="Polly.Joanna">Thank you for your interest in CyberGuard Next Generation Security. Goodbye!</Say>\n  <Hangup/>\n</Response>`;
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
