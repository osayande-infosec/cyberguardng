/**
 * Knowledge Base Lookup Helper
 * Queries D1 database for relevant security information
 */

export async function searchKnowledgeBase(env, query) {
  try {
    // Search articles table for relevant content
    const results = await env.DB.prepare(`
      SELECT 
        id,
        title,
        category,
        content,
        url
      FROM articles
      WHERE 
        title LIKE ? OR
        content LIKE ? OR
        category LIKE ?
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN category LIKE ? THEN 2
          ELSE 3
        END
      LIMIT 3
    `).bind(
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`
    ).all();
    
    if (results.results && results.results.length > 0) {
      return results.results.map(article => ({
        title: article.title,
        category: article.category,
        summary: article.content.substring(0, 200) + '...',
        url: article.url || `https://cyberguardng.ca/resources#${article.id}`,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Knowledge base lookup error:', error);
    return [];
  }
}

/**
 * Get service information
 */
export function getServiceInfo(serviceName) {
  const services = {
    'soc2': {
      title: 'SOC 2 Compliance',
      description: 'We help organizations achieve SOC 2 Type I and Type II certification. Our experts guide you through gap assessments, control implementation, and audit preparation.',
      timeline: '3-6 months typical',
      contact: 'sales@cyberguardng.ca',
    },
    'iso27001': {
      title: 'ISO 27001 Certification',
      description: 'Complete ISO 27001 implementation and certification support. We help establish your Information Security Management System (ISMS) aligned with international standards.',
      timeline: '6-12 months typical',
      contact: 'sales@cyberguardng.ca',
    },
    'pcidss': {
      title: 'PCI DSS Compliance',
      description: 'Payment Card Industry Data Security Standard compliance for businesses handling credit card data. We provide gap assessments, remediation, and validation support.',
      timeline: '2-4 months typical',
      contact: 'sales@cyberguardng.ca',
    },
    'incident-response': {
      title: 'Incident Response',
      description: '24/7 emergency incident response for security breaches, ransomware attacks, and data compromises. Our team provides rapid containment, forensics, and recovery.',
      timeline: 'Immediate response',
      contact: 'emergency@cyberguardng.ca (available 24/7)',
    },
    'pentest': {
      title: 'Penetration Testing',
      description: 'Comprehensive security assessments including network, web application, API, and cloud infrastructure testing. We identify vulnerabilities before attackers do.',
      timeline: '1-2 weeks typical',
      contact: 'sales@cyberguardng.ca',
    },
    'vciso': {
      title: 'Virtual CISO Services',
      description: 'Fractional CISO services providing executive-level security leadership without full-time costs. We develop strategy, manage programs, and provide board-level reporting.',
      timeline: 'Ongoing monthly retainer',
      contact: 'sales@cyberguardng.ca',
    },
  };
  
  const normalized = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try exact match first
  if (services[normalized]) {
    return services[normalized];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(services)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Format knowledge base results for voice response
 */
export function formatForVoice(results) {
  if (!results || results.length === 0) {
    return "I don't have specific information on that topic right now, but I'd be happy to have one of our security specialists call you back with details.";
  }
  
  if (results.length === 1) {
    return `I found information about ${results[0].title}. ${results[0].summary} Would you like me to email you more details, or have a specialist call you?`;
  }
  
  const titles = results.map(r => r.title).join(', ');
  return `I found ${results.length} relevant articles: ${titles}. Would you like me to send these to your email, or connect you with a specialist to discuss?`;
}
