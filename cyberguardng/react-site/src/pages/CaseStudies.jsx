import React from "react";
import { Link } from "react-router-dom";

export default function CaseStudies() {
  return (
    <>
      <main className="section">
        <div className="container">
          <h2>Featured Case Studies</h2>

          <div className="card-grid">
          <article className="card">
            <h3>SOC 2 Readiness for a Fintech Startup</h3>
            <p className="meta">Fintech · 45 employees</p>
            <p>
              Helped a fintech client achieve SOC 2 readiness in ten weeks through gap assessment, remediation
              planning, and evidence support.
            </p>
          </article>

          <article className="card">
            <h3>Incident Response for Healthcare Provider</h3>
            <p className="meta">Healthcare · 120 employees</p>
            <p>
              Contained a ransomware incident, restored operations, and implemented improved playbooks and
              awareness training.
            </p>
          </article>

          <article className="card">
            <h3>PCI Compliance for E commerce</h3>
            <p className="meta">Retail · 35 employees</p>
            <p>
              Guided an online retailer through PCI DSS requirements and helped pass an external assessment
              with no critical findings.
            </p>
          </article>
        </div>

        <div className="cta-subtle">
          <Link to="/contact" className="btn btn-outline">
            Request a Consultation
          </Link>
        </div>
      </div>
    </main>
    
    <section className="hero-image-section">
      <img src="/assets/case-studies-banner.png" alt="CyberGuardNG Overview" className="hero-full-image" />
    </section>
    </>
  );
}