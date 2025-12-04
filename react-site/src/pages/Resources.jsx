import React from "react";
import BlogCard from "../components/BlogCard";

const blogPosts = [
  {
    title: "The 7 Security Gaps Most SMEs Don’t Realize They Have",
    excerpt: "Most breaches in small businesses come from overlooked basics. Learn the hidden gaps attackers exploit and how to close them quickly.",
    slug: "security-gaps-smes"
  },
  {
    title: "ISO 27001 for Small Teams: What’s Required and What Isn’t",
    excerpt: "A simple guide to understanding ISO 27001 without drowning in jargon. See what small teams actually need to become compliant.",
    slug: "iso27001-small-teams"
  },
  {
    title: "How Small Teams Can Use AI to Detect Threats Faster",
    excerpt: "AI isn’t just for large enterprises. Learn how smaller teams can use AI tools to spot threats earlier and reduce burnout.",
    slug: "ai-detect-threats"
  },
  {
    title: "What SMEs Should Do in the First 24 Hours of a Cyber Incident",
    excerpt: "A step-by-step guide to containing damage quickly and preventing a small incident from becoming a crisis.",
    slug: "first-24-hours-incident"
  },
  // previous posts (moved to 5-8)
  {
    title: "Top Cybersecurity Threats for SMEs in 2025",
    excerpt: "Understand the latest threats affecting small and medium businesses and how to strengthen protection.",
    slug: "threats-2025"
  },
  {
    title: "SOC 2 vs ISO 27001: Which Should You Choose?",
    excerpt: "A clear comparison of two leading compliance frameworks and how to decide which fits your business.",
    slug: "soc2-vs-iso"
  },
  {
    title: "Why SMEs Need AI-Supported Security",
    excerpt: "How AI improves detection, reduces alert fatigue, and empowers smaller teams with enterprise-level tools.",
    slug: "ai-security"
  },
  {
    title: "Compliance as a Service Explained",
    excerpt: "The shift toward continuous compliance and what it means for cloud-driven businesses.",
    slug: "compliance-as-a-service"
  }
];

export default function Resources() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Resources & Insights</h2>
            <p>
              Guides, case studies, and practical guidance on cybersecurity, cloud security, and compliance for
              growing businesses.
            </p>
          </div>

          <h3 style={{ marginBottom: "1rem" }}>Featured Blog Articles</h3>
          <div className="card-grid blog-grid">
            {blogPosts.map(post => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}