import React from "react";
import { Link } from "react-router-dom";

export default function CaseStudies() {
  const caseStudies = [
    {
      title: "SOC 2 Readiness for a Fintech Startup",
      industry: "Fintech",
      employees: "45 employees",
      description: "Helped a fintech client achieve SOC 2 readiness in ten weeks through gap assessment, remediation planning, and evidence support.",
      metrics: ["10 weeks to compliance", "Zero critical findings", "Enhanced security posture"]
    },
    {
      title: "Incident Response for Healthcare Provider",
      industry: "Healthcare",
      employees: "120 employees",
      description: "Contained a ransomware incident, restored operations, and implemented improved playbooks and awareness training.",
      metrics: ["24-hour containment", "Full recovery achieved", "Zero data loss"]
    },
    {
      title: "PCI Compliance for E-commerce",
      industry: "Retail",
      employees: "35 employees",
      description: "Guided an online retailer through PCI DSS requirements and helped pass an external assessment with no critical findings.",
      metrics: ["First-time pass", "No critical findings", "Streamlined processes"]
    }
  ];

  return (
    <main className="section">
      <div className="container">
        <div className="section-header">
          <h2>Featured Case Studies</h2>
          <p>Real results from real clients across industries</p>
        </div>

        <div className="case-studies-grid">
          {caseStudies.map((study, index) => (
            <article key={index} className="case-study-card">
              <div className="case-study-header">
                <span className="case-study-badge">{study.industry}</span>
                <span className="case-study-size">{study.employees}</span>
              </div>
              <h3>{study.title}</h3>
              <p>{study.description}</p>
              <div className="case-study-metrics">
                {study.metrics.map((metric, i) => (
                  <div key={i} className="metric-badge">
                    <span>✓</span> {metric}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="cta-subtle">
          <Link to="/contact" className="btn btn-outline">
            Request a Consultation
          </Link>
        </div>
      </div>

      {/* Collaborative Team Section */}
      <section className="collaborative-section">
        <div className="container">
          <div className="collaborative-grid">
            <div className="collaborative-content">
              <h2>Partnership Approach</h2>
              <p>
                We work alongside your team to build sustainable security practices. Our collaborative methodology 
                ensures knowledge transfer and empowers your organization to maintain strong security posture.
              </p>
              <ul className="collaborative-features">
                <li>
                  <span className="feature-icon">🤝</span>
                  <div>
                    <strong>Collaborative Engagement</strong>
                    <p>Working directly with your team members</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📚</span>
                  <div>
                    <strong>Knowledge Transfer</strong>
                    <p>Building internal security capabilities</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">🎯</span>
                  <div>
                    <strong>Tailored Solutions</strong>
                    <p>Customized to your business needs</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="collaborative-image">
              <div className="image-placeholder">
                <div className="placeholder-content">
                  <span>👥</span>
                  <p>Collaborative Team Approach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}