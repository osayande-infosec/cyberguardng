// Cloudflare Pages Function for Contact Form
// Uses MailChannels (free, built into Cloudflare Workers)
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { name, email, company, message, newsletter } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const TO_EMAIL = context.env.CONTACT_EMAIL || "sales@cyberguardng.ca";
    const timestamp = new Date().toLocaleString("en-US", { 
      timeZone: "America/Toronto",
      dateStyle: "full",
      timeStyle: "long"
    });

    // Send email via MailChannels (free with Cloudflare Workers)
    const emailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: TO_EMAIL, name: "CyberGuardNG Sales" }],
            dkim_domain: "cyberguardng.ca",
            dkim_selector: "mailchannels",
          },
        ],
        from: {
          email: "noreply@cyberguardng.ca",
          name: "CyberGuardNG Contact Form",
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `New Contact Form Submission from ${name}`,
        content: [
          {
            type: "text/html",
            value: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0070f3 0%, #00a8ff 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0070f3; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #0070f3; margin-top: 20px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🔒 New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span> ${name}
      </div>
      <div class="field">
        <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
      </div>
      <div class="field">
        <span class="label">Company:</span> ${company || "Not provided"}
      </div>
      <div class="field">
        <span class="label">Newsletter Signup:</span> ${newsletter ? "✓ Yes" : "✗ No"}
      </div>
      <div class="message-box">
        <div class="label" style="margin-bottom: 10px;">Message:</div>
        <div>${message.replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      Submitted on ${timestamp}<br>
      Reply directly to this email to respond to ${name}
    </div>
  </div>
</body>
</html>
            `,
          },
          {
            type: "text/plain",
            value: `
NEW CONTACT FORM SUBMISSION
============================

Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}
Newsletter: ${newsletter ? "Yes" : "No"}

MESSAGE:
--------
${message}

============================
Submitted: ${timestamp}
Reply to: ${email}
            `,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("MailChannels error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email. Please try again or contact us directly at sales@cyberguardng.ca" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for contacting us! We'll get back to you within 2 business hours.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred. Please email us directly at sales@cyberguardng.ca" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
