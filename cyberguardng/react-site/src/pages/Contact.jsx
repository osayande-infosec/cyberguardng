import React from "react";

export default function Contact() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Contact Us</h2>
            <p>Drop us a line. We will get back to you as soon as possible.</p>
          </div>

          <div className="contact-wrapper">
            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
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
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Send
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
