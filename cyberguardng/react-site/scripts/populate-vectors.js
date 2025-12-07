// Script to populate Vectorize with knowledge base content
// Run with: node scripts/populate-vectors.js

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VECTORIZE_API = process.env.VECTORIZE_API_URL; // From Cloudflare

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable not set");
  process.exit(1);
}

async function generateEmbedding(text) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function populateVectors() {
  console.log("Fetching knowledge base content from D1...");
  
  // In production, this would query D1 database
  // For now, we'll use the sample data from schema.sql
  const knowledgeBase = [
    {
      id: 1,
      title: "SOC 2 Compliance Overview",
      content: "SOC 2 is a compliance framework developed by AICPA for service organizations. CyberGuardNG offers comprehensive SOC 2 Type I and Type II audit services. Our process includes gap assessment, control implementation, documentation, and audit support. Timeline: 3-6 months. We support all five trust service criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.",
      category: "compliance"
    },
    {
      id: 2,
      title: "ISO 27001 Certification",
      content: "ISO 27001 is an international standard for information security management. CyberGuardNG guides organizations through the entire certification process including ISMS development, risk assessment, control implementation, internal audits, and external certification. Timeline: 6-12 months. We have certified over 50 organizations globally.",
      category: "compliance"
    },
    {
      id: 3,
      title: "Penetration Testing Services",
      content: "Our penetration testing services identify vulnerabilities before attackers do. We offer web application testing, network testing, mobile app testing, and social engineering assessments. All tests follow OWASP and NIST guidelines. Reports include executive summaries, technical findings, and remediation guidance. Typical duration: 2-4 weeks.",
      category: "service"
    },
    {
      id: 4,
      title: "GDPR Compliance Support",
      content: "CyberGuardNG helps organizations achieve and maintain GDPR compliance. Services include data mapping, privacy impact assessments, DPO services, policy development, and breach response planning. We work with companies processing EU citizen data globally.",
      category: "compliance"
    },
    {
      id: 5,
      title: "Why Choose CyberGuardNG",
      content: "CyberGuardNG stands out with our practical, business-focused approach to cybersecurity. Unlike traditional consultants, we focus on efficient compliance that doesn't slow down your business. Our team has 15+ years of experience, we offer fixed-price engagements, and provide ongoing support post-certification. We specialize in high-growth technology companies.",
      category: "faq"
    },
    {
      id: 6,
      title: "Pricing Structure",
      content: "Our pricing is transparent and based on company size and scope. Typical ranges: SOC 2 Type I ($25K-$50K), SOC 2 Type II ($40K-$80K), ISO 27001 ($30K-$60K), Penetration Testing ($10K-$30K). We offer package deals for multiple services. Contact our sales team for a detailed quote based on your specific needs.",
      category: "faq"
    }
  ];

  console.log(`Processing ${knowledgeBase.length} knowledge base entries...`);

  for (const entry of knowledgeBase) {
    console.log(`Generating embedding for: ${entry.title}`);
    
    // Combine title and content for better search
    const textToEmbed = `${entry.title}\n\n${entry.content}`;
    const embedding = await generateEmbedding(textToEmbed);

    console.log(`Embedding generated (${embedding.length} dimensions)`);

    // In production, insert into Vectorize via Wrangler API
    // For manual setup: Use Cloudflare Dashboard or Wrangler CLI
    console.log(`Vector ID: kb-${entry.id}`);
    console.log(`Metadata: ${JSON.stringify({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      category: entry.category
    })}`);
    console.log('---');

    // Rate limit to avoid hitting OpenAI limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n✅ Vector generation complete!");
  console.log("\nNext steps:");
  console.log("1. Use Wrangler CLI to insert vectors into Vectorize:");
  console.log("   wrangler vectorize insert cyberguardng-knowledge --file=vectors.json");
  console.log("\n2. Or use the Cloudflare Dashboard to manually add vectors");
}

populateVectors().catch(console.error);
