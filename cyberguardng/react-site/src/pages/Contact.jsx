import React, { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(e.target);
    formData.append("access_key", "deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: "success", message: "Thank you! We'll be in touch soon." });
        e.target.reset();
      } else {
        setStatus({ type: "error", message: result.message || "Something went wrong. Please try again." });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus({ type: "error", message: "Network error. Please try again later." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Contact Us</h2>
            <p>Drop us a line. We will get back to you as soon as possible.</p>
          </div>

          <div className="contact-wrapper">
            <form onSubmit={handleSubmit}>
              {status.message && (
                <div style={{
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  borderRadius: "8px",
                  backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
                  color: status.type === "success" ? "#155724" : "#721c24",
                  border: `1px solid ${status.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
                }}>
                  {status.message}
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="_replyto" type="email" required placeholder="you@company.com" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" placeholder="Your company" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="6" required placeholder="Tell us how we can help" />
              </div>
              <div className="checkbox-row">
                <input type="checkbox" id="newsletter" name="newsletter" />
                <label htmlFor="newsletter">Sign up for updates, insights, and occasional promotions.</label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
            </form>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(30,64,175,.6)" }}>
              <p style={{ fontSize: ".9rem", color: "var(--text)", marginBottom: "1rem" }}>
                Prefer email or a quick call? Reach us at{" "}
                <a href="mailto:sales@cyberguardng.ca" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>
                  sales@cyberguardng.ca
                </a>
                {" "}or{" "}
                <a href="tel:+14387734590" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>
                  +1 438 773 4590
                </a>
                .
              </p>
              <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                We typically respond to inquiries within 2 business hours during weekdays.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
