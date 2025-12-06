import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <aside className="hero-panel hero-panel-top-right" aria-label="At a glance">
          <h3>At a glance</h3>
          <div className="hero-panel-row">
            <span>✓ Managed Security Operations</span>
            <span>✓ Continuous Compliance for SOC 2, ISO 27001, HIPAA, PCI DSS</span>
            <span>✓ Cloud Security for AWS, Azure, and GCP</span>
            <span>✓ AI supported detection and awareness training</span>
          </div>
        </aside>
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-kicker">CyberGuardNG</div>
            <h1 className="hero-title">Guarding Your Digital World</h1>
            <p className="hero-subtitle">
              CyberGuardNG provides practical cybersecurity and continuous compliance for growing businesses.
              We help you stay secure and audit-ready across AWS, Azure, and Google Cloud.
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-primary">Get a Consultation</Link>
              <Link to="/services" className="btn btn-outline">View Services</Link>
            </div>
            <div className="hero-badge">
              Trusted support for SMEs that need enterprise grade protection without a full in house security team.
            </div>
          </div>
        </div>
      </section>

      {/* 'Why CyberGuardNG' removed from home — moved to About page */}

      <section className="hero-image-section">
        <img src="/assets/hero-section.png" alt="CyberGuardNG Overview" className="hero-full-image" />
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Ready to Secure Your Business</h2>
            <p>Tell us about your environment and we will help you choose the right starting point.</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/contact" className="btn btn-primary">Contact CyberGuardNG</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
