import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [countersVisible, setCountersVisible] = useState(false);

  useEffect(() => {
    setCountersVisible(true);
  }, []);

  const stats = [
    { value: 10, suffix: "+", label: "Years Experience" },
    { value: 50, suffix: "+", label: "Active Clients" },
    { value: 4, suffix: "", label: "Compliance Frameworks" },
    { value: 99, suffix: "%", label: "Client Satisfaction" }
  ];

  const featuredServices = [
    {
      icon: "🛡️",
      title: "Managed Security",
      description: "24/7 threat monitoring and incident response for your infrastructure",
      link: "/services"
    },
    {
      icon: "📋",
      title: "Compliance Management",
      description: "Continuous compliance for SOC 2, ISO 27001, HIPAA, and PCI DSS",
      link: "/services"
    },
    {
      icon: "☁️",
      title: "Cloud Security",
      description: "Secure your AWS, Azure, and GCP environments with expert guidance",
      link: "/services"
    },
    {
      icon: "🎓",
      title: "Security Training",
      description: "Empower your team with practical security awareness programs",
      link: "/services"
    }
  ];

  const trustLogos = [
    { name: "SOC 2", icon: "🔒" },
    { name: "ISO 27001", icon: "🌐" },
    { name: "HIPAA", icon: "⚕️" },
    { name: "PCI DSS", icon: "💳" }
  ];

  return (
    <main>
      <section className="hero">
        <aside className="hero-panel hero-panel-top-right" aria-label="At a glance">
          <h3>At a glance</h3>
          <div className="hero-panel-row">
            <span>✓ Managed Security Operations</span>
            <span>✓ Continuous Compliance for SOC 2, ISO 27001, HIPAA, PCI DSS</span>
            <span>✓ Cloud Security for AWS, Azure, and GCP</span>
            <span>✓ Practical detection and awareness training</span>
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
              Trusted support for SMEs that need enterprise-grade protection without a full in-house security team.
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="home-stats-banner">
        <div className="container">
          <div className="home-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="home-stat-card">
                <div className="home-stat-value">
                  {countersVisible && <CountUp end={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="home-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Our Core Services</h2>
            <p>Comprehensive security solutions tailored for growing businesses</p>
          </div>
          <div className="home-services-grid">
            {featuredServices.map((service, index) => (
              <Link key={index} to={service.link} className="home-service-card">
                <div className="home-service-icon">{service.icon}</div>
                <h3 className="home-service-title">{service.title}</h3>
                <p className="home-service-desc">{service.description}</p>
                <span className="home-service-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="home-trust-section">
        <div className="container">
          <h3 className="home-trust-title">Compliance Frameworks We Support</h3>
          <div className="home-trust-grid">
            {trustLogos.map((logo, index) => (
              <div key={index} className="home-trust-badge">
                <span className="home-trust-icon">{logo.icon}</span>
                <span className="home-trust-name">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section home-cta-section">
        <div className="container">
          <div className="home-cta-content">
            <h2>Ready to Secure Your Business?</h2>
            <p>Tell us about your environment and we'll help you choose the right starting point.</p>
            <div className="home-cta-actions">
              <Link to="/contact" className="btn btn-primary">Get Started Today</Link>
              <Link to="/about" className="btn btn-outline">Learn More About Us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Helper component for animated counters
function CountUp({ end, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return <>{count}{suffix}</>;
}
