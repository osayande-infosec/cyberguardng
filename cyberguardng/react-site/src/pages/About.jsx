import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function About() {
  const [activeValue, setActiveValue] = useState(null);
  const [countersVisible, setCountersVisible] = useState(false);

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => setCountersVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { value: 10, suffix: "+", label: "Years Combined Experience" },
    { value: 50, suffix: "+", label: "Clients Served" },
    { value: 4, suffix: "", label: "Compliance Frameworks" },
    { value: 99, suffix: "%", label: "Client Satisfaction" }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Practical Security",
      short: "Real-world protection without unnecessary complexity",
      detail: "We focus on what actually protects your business, implementing security measures that make sense for your size and industry. No over-engineered solutions or bloated toolsets—just effective, practical security."
    },
    {
      icon: "🤝",
      title: "Partnership Approach",
      short: "Working alongside your team, not over them",
      detail: "We believe in collaborative engagement. Our experts work directly with your team, ensuring knowledge transfer and building internal capabilities. You're not just getting a service—you're gaining partners."
    },
    {
      icon: "⚡",
      title: "Rapid Response",
      short: "Fast action when you need it most",
      detail: "Whether it's an incident, compliance deadline, or security question, we respond quickly. Our team is available when critical issues arise, with clear escalation paths and 24/7 support options."
    },
    {
      icon: "📈",
      title: "Continuous Improvement",
      short: "Evolving security posture, not one-time fixes",
      detail: "Security isn't a checkbox. We provide ongoing monitoring, regular assessments, and continuous compliance tracking. Your security posture improves over time as threats evolve."
    }
  ];

  const differentiators = [
    {
      traditional: "Build entire security team",
      cyberguard: "Expert-as-a-service model",
      icon: "👥"
    },
    {
      traditional: "Annual compliance audits",
      cyberguard: "Continuous compliance monitoring",
      icon: "✓"
    },
    {
      traditional: "Generic security tools",
      cyberguard: "Tailored cloud-native solutions",
      icon: "☁️"
    },
    {
      traditional: "Reactive incident response",
      cyberguard: "Proactive threat detection",
      icon: "🛡️"
    }
  ];

  return (
    <main>
      {/* Hero Stats Section */}
      <section className="about-hero">
        <div className="container">
          <div className="section-header">
            <h2>About CyberGuardNG</h2>
            <p>We help growing businesses build real cyber resilience without the overhead of a full security team.</p>
          </div>

          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">
                  {countersVisible && (
                    <CountUp end={stat.value} duration={2000} />
                  )}
                  {stat.suffix}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="section">
        <div className="container">
          <div className="about-overview">
            <div className="overview-content">
              <h2>Who We Are</h2>
              <p>
                CyberGuardNG Security Inc. is a Toronto-based cybersecurity and compliance provider serving small and medium
                businesses across North America. We combine security expertise, automation, and AI-driven insights to deliver
                reliable protection that fits modern cloud environments.
              </p>
              <p>
                Founded by security professionals who understand the challenges SMEs face, we've built our services around
                what growing businesses actually need—not what enterprise vendors think they should buy.
              </p>
            </div>
            <div className="overview-visual">
              <div className="vision-mission-grid">
                <div className="vm-card">
                  <span className="vm-icon">🔭</span>
                  <h3>Vision</h3>
                  <p>To empower every organization with automated security and compliance that inspires trust and resilience.</p>
                </div>
                <div className="vm-card">
                  <span className="vm-icon">🎯</span>
                  <h3>Mission</h3>
                  <p>
                    We deliver practical, scalable cybersecurity through managed operations, continuous compliance,
                    cloud security, and team-focused training.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <p>The principles that guide everything we do</p>
          </div>

          <div className="values-grid">
            {values.map((value, index) => (
              <div
                key={index}
                className={`value-card ${activeValue === index ? 'expanded' : ''}`}
                onClick={() => setActiveValue(activeValue === index ? null : index)}
              >
                <div className="value-header">
                  <span className="value-icon">{value.icon}</span>
                  <h3>{value.title}</h3>
                </div>
                <p className="value-short">{value.short}</p>
                {activeValue === index && (
                  <div className="value-detail">
                    <p>{value.detail}</p>
                  </div>
                )}
                <button className="value-toggle">
                  {activeValue === index ? 'Show less ↑' : 'Learn more ↓'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional vs CyberGuardNG */}
      <section className="comparison-section">
        <div className="container">
          <div className="section-header">
            <h2>The CyberGuardNG Difference</h2>
            <p>How we approach security differently</p>
          </div>

          <div className="comparison-grid">
            {differentiators.map((diff, index) => (
              <div key={index} className="comparison-card">
                <div className="comparison-icon">{diff.icon}</div>
                <div className="comparison-row">
                  <div className="comparison-old">
                    <span className="comparison-label">Traditional</span>
                    <p>{diff.traditional}</p>
                  </div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-new">
                    <span className="comparison-label">CyberGuardNG</span>
                    <p>{diff.cyberguard}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose CyberGuardNG</h2>
          </div>
          <div className="why-choose-grid">
            <article className="why-card">
              <span className="why-icon">🤖</span>
              <h3>Modern and AI-Supported</h3>
              <p>We use automation and intelligence where it helps most while keeping humans in the loop for decisions.</p>
            </article>
            <article className="why-card">
              <span className="why-icon">🔗</span>
              <h3>End-to-End for SMEs</h3>
              <p>From monitoring to compliance to awareness, you get a unified approach instead of disconnected tools.</p>
            </article>
            <article className="why-card">
              <span className="why-icon">💡</span>
              <h3>Clear Guidance</h3>
              <p>We provide practical recommendations that your engineering and leadership teams can act on.</p>
            </article>
            <article className="why-card">
              <span className="why-icon">🏆</span>
              <h3>Experienced Leadership</h3>
              <p>Our team has experience in SOC 2 and ISO 27001 implementations, cloud security engineering, SIEM, MDR, and incident response.</p>
            </article>
          </div>

          <div className="cta-subtle">
            <Link to="/contact" className="btn btn-primary">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Simple counter component
function CountUp({ end, duration }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
}
