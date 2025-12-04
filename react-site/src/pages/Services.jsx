import React from "react";

export default function Services() {
  const services = [
    {
      title: "Managed Security Services (MSSP)",
      description: "Our team monitors your environment day and night to detect unusual activity, analyze threats, and respond quickly. You get real protection without building your own SOC.",
    },
    {
      title: "Compliance as a Service",
      description: "We help you stay audit ready all year with continuous monitoring, automated evidence collection, policy development, and guided remediation for SOC 2, ISO 27001, HIPAA, and PCI DSS.",
    },
    {
      title: "Cloud Security Hardening and Monitoring",
      description: "We secure your cloud environments across AWS, Azure, and Google Cloud by tightening configurations, improving IAM hygiene, and enabling real-time monitoring. You get safer cloud workloads and fewer misconfiguration risks.",
    },
    {
      title: "Vendor and Third-Party Risk Management",
      description: "We review the security posture of your vendors, assess their controls, and help you monitor ongoing risk. This strengthens your supply chain and gives you confidence when working with external partners.",
    },
    {
      title: "Security Policy Development and Governance Support",
      description: "We help you establish clear, practical security policies tailored to your business. This includes access control, data handling, remote work, and incident response standards that support both compliance and daily operations.",
    },
    {
      title: "Employee Awareness and Phishing Simulation",
      description: "Your employees become your strongest defense through engaging training and realistic phishing simulations. Our program helps reduce risky behavior and strengthens your overall security posture.",
    },
    {
      title: "Penetration Testing and Red Teaming",
      description: "We test your systems like real attackers and provide clear steps to fix weaknesses before they lead to a breach. This covers networks, applications, and cloud workloads.",
    },
    {
      title: "Incident Response Retainer",
      description: "If something goes wrong, our team helps contain the threat, investigate the root cause, restore operations, and prepare any needed reporting. You get fast support when you need it most.",
    },
  ];

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive cybersecurity and compliance services designed for small and medium sized organizations.</p>
          </div>
          <div className="card-grid">
            {services.map((service, index) => (
              <article className="card" key={index}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
