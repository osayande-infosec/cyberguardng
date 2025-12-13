// Cloudflare Function: sms-webhook.js
// Forwards SMS to email and sends an automated thank you SMS reply

export async function onRequestPost(context) {
  const request = context.request;
  const formData = await request.formData();
  const from = formData.get("From");
  const body = formData.get("Body");

  // Forward SMS to email (MailChannels)
  const mailData = {
    personalizations: [
      { to: [{ email: 'sales@cyberguardng.ca' }] }
    ],
    from: { email: 'sms@cyberguardng.ca', name: 'CyberGuardNG SMS' },
    subject: `New SMS from ${from}`,
    content: [
      {
        type: 'text/html',
        value:
          `<p>You have received a new SMS message.</p>` +
          `<p><b>From:</b> ${from}</p>` +
          `<p><b>Message:</b> ${body}</p>`
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

  // Respond to Twilio with a thank you SMS
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>Thank you for contacting CyberGuard Next Generation Security Inc. Our team will respond as soon as possible.</Message>\n</Response>`;
  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" }
  });
}
