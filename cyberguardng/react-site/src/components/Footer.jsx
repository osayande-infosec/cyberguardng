import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          CyberGuardNG Security Inc. · Security. Compliance. Confidence. © {year}
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/resources">Resources</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
}
