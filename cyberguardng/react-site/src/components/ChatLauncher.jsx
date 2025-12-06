import React, { useEffect, useRef, useState } from "react";

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I'm Yande, CyberGuardNG Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Auto-open chat after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 2000);
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
      const res = await fetch("/functions/chat", {
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

      const data = await res.json();

      if (!res.ok) {
        console.error("Chat API error:", data);
        const errorMsg = data.error || `Server error: ${res.status}`;
        throw new Error(errorMsg);
      }

      const reply =
        (data && data.reply) ||
        "I am here to help, but I could not get a response from the assistant.";

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