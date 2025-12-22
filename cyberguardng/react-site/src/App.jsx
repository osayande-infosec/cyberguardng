import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatLauncher from "./components/ChatLauncher";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import BlogArticle from "./pages/BlogArticle";
import CaseStudies from "./pages/CaseStudies";
import Portal from "./pages/Portal";
import PortalLogin from "./pages/PortalLogin";
import Onboarding from "./pages/Onboarding";
import AdminClients from "./pages/AdminClients";
import AdminClientDetail from "./pages/AdminClientDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/portal");

  return (
    <>
      <CookieBanner />
      {!isPortalRoute && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/onboarding" element={<Onboarding />} />
        <Route path="/portal/admin/clients" element={<AdminClients />} />
        <Route path="/portal/admin/clients/:orgId" element={<AdminClientDetail />} />
      </Routes>
      {!isPortalRoute && <ChatLauncher />}
      {!isPortalRoute && <Footer />}
    </>
  );
}