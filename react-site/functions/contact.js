// Cloudflare Pages Function for Contact Form
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

    // Email service API key (Resend, SendGrid, or Mailgun)
    const EMAIL_API_KEY = context.env.EMAIL_API_KEY;
    const TO_EMAIL = context.env.CONTACT_EMAIL || "sales@cyberguardng.ca";

    if (!EMAIL_API_KEY) {
      // Fallback: Log to console if no email service configured
      console.log("Contact form submission:", { name, email, company, message });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Form received (email service not configured)" 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Using Resend API (can be adapted for SendGrid/Mailgun)
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CyberGuardNG Contact <noreply@cyberguardng.ca>",
        to: [TO_EMAIL],
        reply_to: email,
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "Not provided"}</p>
          <p><strong>Newsletter:</strong> ${newsletter ? "Yes" : "No"}</p>
          <hr>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Submitted at: ${new Date().toISOString()}</p>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}
Newsletter: ${newsletter ? "Yes" : "No"}

Message:
${message}

Submitted at: ${new Date().toISOString()}
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Email send error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Thank you for contacting us! We'll get back to you soon." 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
