import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <div className="brand">
          <Link to="/" onClick={closeMenu} style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="logo">CYBERGUARDNG SECURITY INC.</div>
            <div className="tagline">Modern Cybersecurity for Growing Businesses</div>
          </Link>
        </div>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav className={`nav ${open ? "open" : ""}`} aria-label="Primary navigation">
          <Link to="/" onClick={closeMenu} aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          <Link to="/about" onClick={closeMenu} aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
          <Link to="/services" onClick={closeMenu} aria-current={pathname === "/services" ? "page" : undefined}>Services</Link>
          <Link to="/resources" onClick={closeMenu} aria-current={pathname === "/resources" ? "page" : undefined}>Resources</Link>
          <Link to="/case-studies" onClick={closeMenu} aria-current={pathname === "/case-studies" ? "page" : undefined}>Case Studies</Link>
          <Link
            to="/contact"
            className="nav-cta"
            onClick={closeMenu}
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
