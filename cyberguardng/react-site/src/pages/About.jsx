import React from "react";

export default function About() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>About CyberGuardNG</h2>
            <p>We help small and medium sized businesses build real cyber resilience without the overhead of a full security team.</p>
          </div>

          {/* removed slide image as requested */}

          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3>Company Overview</h3>
            <p>
              CyberGuardNG Security Inc. is a Toronto based cybersecurity and compliance provider serving small and medium
              businesses across North America. We combine security expertise, automation, and AI driven insights to deliver
              reliable protection that fits modern cloud environments.
            </p>
          </div>

          <div className="card-grid" style={{ marginBottom: "2rem" }}>
            <article className="card">
              <h3>Vision</h3>
              <p>To empower every organization with automated security and compliance that inspires trust and resilience.</p>
            </article>
            <article className="card">
              <h3>Mission</h3>
              <p>
                We deliver practical, scalable cybersecurity through managed security operations, continuous compliance monitoring,
                cloud security for AWS, Azure, and GCP, proactive testing and risk assessments, and employee focused security training.
              </p>
            </article>
          </div>

          {/* AI Powered Capabilities section removed per request */}
          <div className="section-header">
            <h2>Why CyberGuardNG</h2>
          </div>
          <div className="card-grid">
            <article className="card">
              <h3>Modern and AI Supported</h3>
              <p>We use automation and intelligence where it helps most while keeping humans in the loop for decisions.</p>
            </article>
            <article className="card">
              <h3>End to End for SMEs</h3>
              <p>From monitoring to compliance to awareness, you get a unified approach instead of disconnected tools.</p>
            </article>
            <article className="card">
              <h3>Clear Guidance</h3>
              <p>We provide practical recommendations that your engineering and leadership teams can act on.</p>
            </article>
            <article className="card">
              <h3>Experienced Leadership</h3>
              <p>Our team has experience in SOC 2 and ISO 27001 implementations, cloud security engineering, SIEM, MDR, and incident response.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
