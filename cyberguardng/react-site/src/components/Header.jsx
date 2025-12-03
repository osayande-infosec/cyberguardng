import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <div className="brand">
          <div className="logo">CYBERGUARDNG SECURITY INC.</div>
          <div className="tagline">Modern Cybersecurity for Growing Businesses</div>
        </div>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav className={`nav ${open ? "open" : ""}`} aria-label="Primary navigation">
          <Link to="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          <Link to="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
          <Link to="/services" aria-current={pathname === "/services" ? "page" : undefined}>Services</Link>
          <Link to="/resources" aria-current={pathname === "/resources" ? "page" : undefined}>Resources</Link>
          <Link to="/case-studies" aria-current={pathname === "/case-studies" ? "page" : undefined}>Case Studies</Link>
          <Link
            to="/contact"
            className="nav-cta"
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
