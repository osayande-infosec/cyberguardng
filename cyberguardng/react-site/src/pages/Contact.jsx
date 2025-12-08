import React, { useState, useEffect, useRef } from "react";

export default function Contact() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);

  useEffect(() => {
    // Load Turnstile script with SRI
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.integrity = "sha384-TBbZ0IqtHQspfFNz2Pb1D3b0iLHdaWuQTrSwXVIHiPvOlJmMWtHGsKPH3xLN2fFF";
    
    script.onload = () => {
      // Render Turnstile widget after script loads
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACFV98o85pvOFYlJ',
          callback: (token) => {
            setTurnstileToken(token);
          },
          theme: 'light'
        });
      }
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Validate Turnstile token
    if (!turnstileToken) {
      setStatus({ type: "error", message: "Please complete the CAPTCHA verification" });
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    formData.append("access_key", "deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783");
    formData.append("cf-turnstile-response", turnstileToken);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: "success", message: "Thank you! We'll be in touch soon." });
        e.target.reset();
        setTurnstileToken("");
        if (window.turnstile) {
          window.turnstile.reset(turnstileRef.current);
        }
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
              
              {/* Cloudflare Turnstile CAPTCHA */}
              <div 
                ref={turnstileRef}
                style={{ marginTop: "1rem", minHeight: "65px" }}
              ></div>
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading || !turnstileToken}>
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
                We typically respond to inquiries shortly during weekdays.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
