import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Services() {
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const services = [
    {
      title: "Managed Security Services (MSSP)",
      category: "monitoring",
      icon: "🛡️",
      shortDesc: "24/7 monitoring and threat detection without building your own SOC.",
      description: "Our team monitors your environment day and night to detect unusual activity, analyze threats, and respond quickly. You get real protection without building your own SOC.",
      features: ["24/7 monitoring", "Threat detection", "Rapid response", "No SOC required"]
    },
    {
      title: "Compliance as a Service",
      category: "compliance",
      icon: "✓",
      shortDesc: "Stay audit-ready all year with continuous monitoring and evidence collection.",
      description: "We help you stay audit ready all year with continuous monitoring, automated evidence collection, policy development, and guided remediation for SOC 2, ISO 27001, HIPAA, and PCI DSS.",
      features: ["SOC 2 & ISO 27001", "Automated evidence", "Policy development", "Continuous monitoring"]
    },
    {
      title: "Cloud Security Hardening",
      category: "cloud",
      icon: "☁️",
      shortDesc: "Secure AWS, Azure, and GCP with configuration tightening and monitoring.",
      description: "We secure your cloud environments across AWS, Azure, and Google Cloud by tightening configurations, improving IAM hygiene, and enabling real-time monitoring. You get safer cloud workloads and fewer misconfiguration risks.",
      features: ["Multi-cloud support", "IAM optimization", "Real-time monitoring", "Config hardening"]
    },
    {
      title: "Vendor Risk Management",
      category: "governance",
      icon: "🤝",
      shortDesc: "Review and monitor third-party vendor security posture.",
      description: "We review the security posture of your vendors, assess their controls, and help you monitor ongoing risk. This strengthens your supply chain and gives you confidence when working with external partners.",
      features: ["Vendor assessments", "Control review", "Ongoing monitoring", "Risk scoring"]
    },
    {
      title: "Security Policy Development",
      category: "governance",
      icon: "📋",
      shortDesc: "Establish clear, practical security policies tailored to your business.",
      description: "We help you establish clear, practical security policies tailored to your business. This includes access control, data handling, remote work, and incident response standards that support both compliance and daily operations.",
      features: ["Custom policies", "Access control", "Data handling", "Incident response"]
    },
    {
      title: "Employee Awareness Training",
      category: "training",
      icon: "🎓",
      shortDesc: "Engaging training and phishing simulations to strengthen your team.",
      description: "Your employees become your strongest defense through engaging training and realistic phishing simulations. Our program helps reduce risky behavior and strengthens your overall security posture.",
      features: ["Phishing simulation", "Interactive training", "Behavior tracking", "Ongoing education"]
    },
    {
      title: "Penetration Testing",
      category: "testing",
      icon: "🔍",
      shortDesc: "Test systems like real attackers and fix weaknesses before breaches.",
      description: "We test your systems like real attackers and provide clear steps to fix weaknesses before they lead to a breach. This covers networks, applications, and cloud workloads.",
      features: ["Network testing", "App security", "Cloud penetration", "Detailed reports"]
    },
    {
      title: "Incident Response Retainer",
      category: "monitoring",
      icon: "🚨",
      shortDesc: "Fast support when breaches occur—containment, investigation, recovery.",
      description: "If something goes wrong, our team helps contain the threat, investigate the root cause, restore operations, and prepare any needed reporting. You get fast support when you need it most.",
      features: ["24/7 availability", "Threat containment", "Root cause analysis", "Recovery support"]
    },
  ];

  const categories = [
    { id: "all", label: "All Services", icon: "📦" },
    { id: "monitoring", label: "Monitoring", icon: "🛡️" },
    { id: "compliance", label: "Compliance", icon: "✓" },
    { id: "cloud", label: "Cloud Security", icon: "☁️" },
    { id: "governance", label: "Governance", icon: "📋" },
    { id: "training", label: "Training", icon: "🎓" },
    { id: "testing", label: "Testing", icon: "🔍" }
  ];

  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive cybersecurity and compliance services designed for growing organizations.</p>
          </div>

          {/* Category Filter */}
          <div className="service-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="category-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredServices.map((service, index) => (
              <article 
                key={index} 
                className={`service-card ${expandedCard === index ? 'expanded' : ''}`}
                onClick={() => setExpandedCard(expandedCard === index ? null : index)}
              >
                <div className="service-card-header">
                  <span className="service-icon">{service.icon}</span>
                  <h3>{service.title}</h3>
                </div>
                <p className="service-short">{service.shortDesc}</p>
                
                {expandedCard === index && (
                  <div className="service-details">
                    <p className="service-full-desc">{service.description}</p>
                    <div className="service-features">
                      {service.features.map((feature, i) => (
                        <span key={i} className="feature-tag">
                          <span>✓</span> {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <button className="expand-btn">
                  {expandedCard === index ? 'Show less' : 'Learn more'} 
                  <span>{expandedCard === index ? '↑' : '↓'}</span>
                </button>
              </article>
            ))}
          </div>

          <div className="cta-subtle">
            <Link to="/contact" className="btn btn-primary">
              Discuss Your Needs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
