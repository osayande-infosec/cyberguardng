import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  const socialLinks = [
    { name: 'LinkedIn', url: 'https://linkedin.com/company/cyberguardng', icon: '💼' },
    { name: 'Twitter', url: 'https://twitter.com/cyberguardng', icon: '𝕏' },
    { name: 'Facebook', url: 'https://facebook.com/cyberguardng', icon: '👍' },
    { name: 'GitHub', url: 'https://github.com/cyberguardng', icon: '⚙️' },
    { name: 'YouTube', url: 'https://youtube.com/@cyberguardng', icon: '▶️' }
  ];
  
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-section">
          <div className="footer-brand">
            CyberGuardNG Security Inc. · Security. Compliance. Confidence.
          </div>
          <div className="footer-copyright">
            © {year} CyberGuardNG Security Inc. All rights reserved.
          </div>
        </div>
        
        <div className="footer-section">
          <div className="footer-links">
            <a href="/">Home</a>
            <a href="/services">Services</a>
            <a href="/resources">Resources</a>
            <a href="/contact">Contact</a>
          </div>
          
          <div className="footer-social">
            {socialLinks.map(link => (
              <a 
                key={link.name}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={link.name}
                title={link.name}
              >
                <span className="social-icon">{link.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
