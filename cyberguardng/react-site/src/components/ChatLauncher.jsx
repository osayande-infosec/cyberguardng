import React, { useEffect, useRef, useState } from "react";

// Generate unique visitor ID (stored in localStorage)
function getVisitorId() {
  let visitorId = localStorage.getItem('cyberguard_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cyberguard_visitor_id', visitorId);
  }
  return visitorId;
}

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I'm Yande, CyberGuardNG Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [visitorId] = useState(getVisitorId());
  const [sessionId, setSessionId] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            user_agent: navigator.userAgent,
            country: 'Unknown',
            city: 'Unknown'
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
          setIsReturning(data.is_returning);
          
          // Update greeting for returning visitors
          if (data.is_returning) {
            setMessages([
              { from: "bot", text: "Welcome back! 🎉 It's great to see you again. How can I help you today?" }
            ]);
          }
        }
      } catch (error) {
        console.error('Session init error:', error);
      }
    }
    
    initSession();
  }, [visitorId]);

  // Auto-open chat after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const thinking = { from: "bot", text: "Yande is thinking…", temp: true };
    setMessages(prev => [...prev, thinking]);

    try {
      const res = await fetch("/api/chat-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          visitor_id: visitorId,
          session_id: sessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Chat API error:", data);
        const errorMsg = data.error || `Server error: ${res.status}`;
        throw new Error(errorMsg);
      }

      const data = await res.json();
      let reply =
        (data && data.reply) ||
        "I am here to help, but I could not get a response from the assistant.";

      // Check if reply contains the contact form trigger
      if (reply.includes("[SHOW_CONTACT_FORM]")) {
        // Remove the trigger from the displayed message
        reply = reply.replace("[SHOW_CONTACT_FORM]", "").trim();
        setShowContactForm(true);
      }

      setMessages((prev) => [
        ...prev.filter((m) => !m.temp),
        { from: "bot", text: reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev.filter((m) => !m.temp),
        {
          from: "bot",
          text: err.message || "Sorry, I had trouble reaching the CyberGuardNG server. Please try again shortly.",
        },
      ]);
    }
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      // Submit to our backend (saves to D1 + sends email)
      const res = await fetch('/api/contact-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          visitor_id: visitorId,
          session_id: sessionId,
          source: 'chat'
        })
      });

      const result = await res.json();

      if (result.success) {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: "✅ Thank you! Your consultation request has been submitted. A member of our sales team will contact you shortly." },
        ]);
        setShowContactForm(false);
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        throw new Error(result.error || "Form submission failed");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "⚠️ There was an issue submitting your request. Please email us directly at sales@cyberguardng.ca or try again." },
      ]);
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          className="chat-launcher"
          title="Chat with CyberGuardNG"
          onClick={() => setOpen(true)}
        >
          <span role="img" aria-label="chat">
            💬
          </span>
        </button>
      )}

      {open && (
        <div className="chat-widget open" aria-hidden={!open}>
          <div className="chat-header">
            <div className="chat-header-brand">
              <img 
                src="/assets/yande-avatar.png" 
                alt="Yande" 
                className="chat-avatar"
              />
              <div className="chat-avatar-info">
                <div className="chat-avatar-label">Yande</div>
                <div className="chat-avatar-tagline">Security. Compliance. Confidence.</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-message ${m.from}${i === 0 && m.from === "bot" ? " greeting" : ""}`}
              >
                {m.text}
              </div>
            ))}
            
            {showContactForm && (
              <div className="chat-contact-form">
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Your Email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Tell us about your needs *"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows="3"
                      required
                    />
                  </div>
                  <button type="submit" className="form-submit" disabled={formSubmitting}>
                    {formSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button 
                    type="button" 
                    className="form-cancel" 
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>

          <form className="chat-footer" onSubmit={handleSubmit}>
            <input
              className="chat-input"
              type="text"
              placeholder="Type here…"
              value={input}
              onChange={e => setInput(e.target.value)}
              required
            />
            <button className="chat-send" type="submit">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}