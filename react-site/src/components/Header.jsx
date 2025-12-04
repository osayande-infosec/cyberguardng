import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navRef = useRef(null);

  const closeMenu = () => setOpen(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && navRef.current && !navRef.current.contains(event.target)) {
        const menuToggle = document.querySelector('.menu-toggle');
        if (!menuToggle?.contains(event.target)) {
          closeMenu();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <div className="brand">
          <Link to="/" onClick={closeMenu} style={{textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '.75rem'}}>
            <img src="/assets/cyberguard-logo.png" alt="CyberGuardNG Logo" className="logo-img" />
            <div className="brand-text">
              <div className="brand-name">CYBERGUARDNG SECURITY INC.</div>
              <div className="tagline">Modern Cybersecurity for Growing Businesses</div>
            </div>
          </Link>
        </div>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav className={`nav ${open ? "open" : ""}`} aria-label="Primary navigation" ref={navRef}>
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
