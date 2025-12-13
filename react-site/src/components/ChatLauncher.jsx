import React, { useEffect, useRef, useState } from "react";

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I'm Yande, CyberGuardNG Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", company: "", message: "" });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const bodyRef = useRef(null);

  const suggestedQuestions = [
    "Can you help assess my company's security posture?",
    "What cybersecurity services do you offer?",
    "How do I know which compliance framework I need?",
    "How long does it take to get audit-ready?",
    "How do I book a consultation?"
  ];

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

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

    setShowSuggestions(false); // Hide suggestions after first message
    
    // Check if asking about booking/consultation - show form immediately
    if (text.toLowerCase().includes('book') || 
        text.toLowerCase().includes('consultation') ||
        text.toLowerCase().includes('contact') ||
        text.toLowerCase().includes('schedule')) {
      const userMsg = { from: "user", text };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "I'd be happy to help you schedule a consultation! Please fill out this quick form and our team will reach out shortly." }
      ]);
      setShowContactForm(true);
      return;
    }
    
    const userMsg = { from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const thinking = { from: "bot", text: "Yande is thinking…", temp: true };
    setMessages(prev => [...prev, thinking]);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: [...messages, userMsg].map((m) => ({
            role: m.from === "bot" ? "assistant" : "user",
            content: m.text,
          })),
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
          text: "Sorry, I had trouble reaching the CyberGuardNG server. Please try again shortly.",
        },
      ]);
    }
  }

  function handleSuggestionClick(question) {
    setInput(question);
    setShowSuggestions(false);
    // Auto-submit the question
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      document.querySelector('.chat-footer').dispatchEvent(submitEvent);
    }, 100);
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("access_key", "deb5b1b1-8dfe-438e-b9ed-5c99aaeb8783");
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("company", formData.company);
      submitData.append("message", formData.message);
      submitData.append("subject", `Consultation Request from ${formData.name} (via Yande)`);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: "✅ Thank you! Your consultation request has been submitted. A member of our sales team will contact you shortly." },
        ]);
        setShowContactForm(false);
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
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
            
            {showSuggestions && messages.length === 1 && (
              <div className="chat-suggestions">
                <div className="suggestions-label">Quick questions:</div>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
            
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