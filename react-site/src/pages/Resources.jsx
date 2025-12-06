import React, { useState } from "react";
import BlogCard from "../components/BlogCard";

const blogPosts = [
  {
    title: "The 7 Security Gaps Most SMEs Don't Realize They Have",
    excerpt: "Most breaches in small businesses come from overlooked basics. Learn the hidden gaps attackers exploit and how to close them quickly.",
    slug: "security-gaps-smes",
    category: "security",
    readTime: "5 min"
  },
  {
    title: "ISO 27001 for Small Teams: What's Required and What Isn't",
    excerpt: "A simple guide to understanding ISO 27001 without drowning in jargon. See what small teams actually need to become compliant.",
    slug: "iso27001-small-teams",
    category: "compliance",
    readTime: "7 min"
  },
  {
    title: "How Small Teams Can Use AI to Detect Threats Faster",
    excerpt: "AI isn't just for large enterprises. Learn how smaller teams can use AI tools to spot threats earlier and reduce burnout.",
    slug: "ai-detect-threats",
    category: "technology",
    readTime: "6 min"
  },
  {
    title: "What SMEs Should Do in the First 24 Hours of a Cyber Incident",
    excerpt: "A step-by-step guide to containing damage quickly and preventing a small incident from becoming a crisis.",
    slug: "first-24-hours-incident",
    category: "incident",
    readTime: "8 min"
  },
  {
    title: "Top Cybersecurity Threats for SMEs in 2025",
    excerpt: "Understand the latest threats affecting small and medium businesses and how to strengthen protection.",
    slug: "threats-2025",
    category: "security",
    readTime: "6 min"
  },
  {
    title: "SOC 2 vs ISO 27001: Which Should You Choose?",
    excerpt: "A clear comparison of two leading compliance frameworks and how to decide which fits your business.",
    slug: "soc2-vs-iso",
    category: "compliance",
    readTime: "5 min"
  },
  {
    title: "Why SMEs Need AI-Supported Security",
    excerpt: "How AI improves detection, reduces alert fatigue, and empowers smaller teams with enterprise-level tools.",
    slug: "ai-security",
    category: "technology",
    readTime: "4 min"
  },
  {
    title: "Compliance as a Service Explained",
    excerpt: "The shift toward continuous compliance and what it means for cloud-driven businesses.",
    slug: "compliance-as-a-service",
    category: "compliance",
    readTime: "5 min"
  }
];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Topics", count: blogPosts.length },
    { id: "security", label: "Security", count: blogPosts.filter(p => p.category === "security").length },
    { id: "compliance", label: "Compliance", count: blogPosts.filter(p => p.category === "compliance").length },
    { id: "technology", label: "Technology", count: blogPosts.filter(p => p.category === "technology").length },
    { id: "incident", label: "Incident Response", count: blogPosts.filter(p => p.category === "incident").length }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

          {/* Search Bar */}
          <div className="resources-search">
            <input
              type="text"
              placeholder="🔍 Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category Tabs */}
          <div className="resource-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`resource-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
                <span className="tab-count">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="results-info">
            <p>{filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found</p>
          </div>

          {/* Blog Grid */}
          <div className="card-grid blog-grid">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <BlogCard key={post.slug} {...post} />
              ))
            ) : (
              <div className="no-results">
                <p>No articles found matching your search.</p>
                <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }} className="btn btn-outline">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
