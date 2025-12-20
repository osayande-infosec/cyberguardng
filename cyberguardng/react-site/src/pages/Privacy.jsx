import React from "react";

export default function Privacy() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Privacy Policy</h1>
            <p>Last updated: December 18, 2025</p>
          </div>

          <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2>1. Information We Collect</h2>
            <p>When you use CyberGuardNG services, we may collect:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address when you sign in via Google or Enterprise SSO</li>
              <li><strong>Contact Information:</strong> Information you provide through our contact form</li>
              <li><strong>Usage Data:</strong> How you interact with our website (via Cloudflare Analytics)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Provide access to the Client Portal</li>
              <li>Respond to your inquiries</li>
              <li>Improve our services</li>
              <li>Send service-related communications</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>TLS 1.3 encryption for all data in transit</li>
              <li>Secure session management with HttpOnly cookies</li>
              <li>No storage of passwords (OAuth-based authentication)</li>
              <li>Regular security assessments</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Google OAuth:</strong> For authentication (governed by Google's Privacy Policy)</li>
              <li><strong>Cloudflare:</strong> For hosting, security, and analytics</li>
              <li><strong>Web3Forms:</strong> For contact form submissions</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>We retain your data only as long as necessary to provide our services. Session data expires after 8 hours of inactivity.</p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h2>7. PIPEDA Compliance</h2>
            <p>As a Canadian company, we comply with the Personal Information Protection and Electronic Documents Act (PIPEDA).</p>

            <h2>8. Contact Us</h2>
            <p>For privacy-related inquiries:</p>
            <p>
              <strong>Email:</strong> <a href="mailto:privacy@cyberguardng.ca" style={{ color: "var(--accent)" }}>privacy@cyberguardng.ca</a><br />
              <strong>Address:</strong> CyberGuard Next Generation Security Inc., Canada
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>We may update this policy periodically. We will notify you of significant changes via email or website notice.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
