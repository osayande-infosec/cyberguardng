// Cloudflare Pages Function for Contact Form
// Uses Web3Forms (free, no DNS setup required)
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

    const WEB3FORMS_KEY = context.env.WEB3FORMS_ACCESS_KEY;
    
    if (!WEB3FORMS_KEY) {
      console.error("WEB3FORMS_ACCESS_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "Contact form not configured. Please email us directly at sales@cyberguardng.ca" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send via Web3Forms
    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("company", company || "Not provided");
    formData.append("message", message);
    formData.append("newsletter", newsletter ? "Yes" : "No");
    formData.append("subject", `Contact Form: ${name}`);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    let result;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      console.error("Web3Forms non-JSON response:", text);
      result = { success: false, message: text };
    }

    if (!response.ok || !result.success) {
      console.error("Web3Forms error:", result);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send message. Please try again or email us at sales@cyberguardng.ca" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

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
