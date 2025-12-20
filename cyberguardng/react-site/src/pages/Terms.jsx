import React from "react";

export default function Terms() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h1>Terms of Service</h1>
            <p>Last updated: December 18, 2025</p>
          </div>

          <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using CyberGuardNG services, you agree to be bound by these Terms of Service and our Privacy Policy.</p>

            <h2>2. Services</h2>
            <p>CyberGuard Next Generation Security Inc. provides:</p>
            <ul>
              <li>Cybersecurity consulting services</li>
              <li>Compliance assessment and certification support (SOC 2, ISO 27001, etc.)</li>
              <li>Security assessments and penetration testing</li>
              <li>Client Portal access for project management</li>
            </ul>

            <h2>3. Client Portal Access</h2>
            <p>Access to the Client Portal is provided to authorized clients only. You agree to:</p>
            <ul>
              <li>Keep your login credentials secure</li>
              <li>Not share access with unauthorized individuals</li>
              <li>Report any suspected security breaches immediately</li>
              <li>Use the portal only for its intended purpose</li>
            </ul>

            <h2>4. Confidentiality</h2>
            <p>All information shared through our services, including security assessments, compliance reports, and recommendations, is confidential. You agree not to disclose this information to third parties without our written consent.</p>

            <h2>5. Intellectual Property</h2>
            <p>All content, methodologies, tools, and materials provided by CyberGuardNG remain our intellectual property. You receive a limited license to use deliverables for your internal business purposes only.</p>

            <h2>6. Limitation of Liability</h2>
            <p>CyberGuardNG provides security consulting services to help improve your security posture. However:</p>
            <ul>
              <li>We do not guarantee complete protection against all threats</li>
              <li>We are not liable for breaches that occur despite our recommendations</li>
              <li>Our liability is limited to the fees paid for the specific service</li>
            </ul>

            <h2>7. Payment Terms</h2>
            <p>Payment terms are specified in individual service agreements. Generally:</p>
            <ul>
              <li>Invoices are due within 30 days</li>
              <li>Late payments may incur interest charges</li>
              <li>Services may be suspended for non-payment</li>
            </ul>

            <h2>8. Termination</h2>
            <p>Either party may terminate services with 30 days written notice. Upon termination:</p>
            <ul>
              <li>Access to the Client Portal will be revoked</li>
              <li>Outstanding invoices become immediately due</li>
              <li>Confidentiality obligations continue</li>
            </ul>

            <h2>9. Governing Law</h2>
            <p>These terms are governed by the laws of Canada and the Province of Ontario. Any disputes shall be resolved in the courts of Ontario.</p>

            <h2>10. Changes to Terms</h2>
            <p>We may update these terms periodically. Continued use of our services constitutes acceptance of updated terms.</p>

            <h2>11. Contact</h2>
            <p>For questions about these terms:</p>
            <p>
              <strong>Email:</strong> <a href="mailto:legal@cyberguardng.ca" style={{ color: "var(--accent)" }}>legal@cyberguardng.ca</a><br />
              <strong>Website:</strong> <a href="https://cyberguardng.ca" style={{ color: "var(--accent)" }}>cyberguardng.ca</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
