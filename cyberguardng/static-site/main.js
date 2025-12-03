document.addEventListener("DOMContentLoaded", function () {
  // dynamic year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // mobile nav
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  // cookie banner
  const cookieBanner = document.getElementById("cookie-banner");
  const cookieAccept = document.getElementById("cookie-accept");
  if (cookieBanner && cookieAccept) {
    if (!localStorage.getItem("cg-cookie")) {
      cookieBanner.style.display = "block";
    }
    cookieAccept.addEventListener("click", () => {
      localStorage.setItem("cg-cookie", "yes");
      cookieBanner.style.display = "none";
    });
  }

  // chatbot
  const launcher = document.querySelector(".chat-launcher");
  const widget = document.getElementById("chat-widget");
  const closeBtn = document.getElementById("chat-close");
  const chatBody = document.getElementById("chat-body");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  if (!launcher || !widget || !chatBody || !chatForm || !chatInput) {
    return;
  }

  let chatHistory = [
    {
      from: "bot",
      text: "Hi, I’m Yande, CyberGuardNG Assistant. How can I help you today?",
    },
  ];

  function renderMessage(text, from) {
    const div = document.createElement("div");
    div.className = "chat-message " + from;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  launcher.addEventListener("click", () => {
    const isOpen = widget.classList.toggle("open");
    widget.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      chatInput.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      widget.classList.remove("open");
      widget.setAttribute("aria-hidden", "true");
    });
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    renderMessage(text, "user");
    chatHistory.push({ from: "user", text });
    chatInput.value = "";

    const thinking = document.createElement("div");
    thinking.className = "chat-message bot";
    thinking.textContent = "Yande is thinking…";
    thinking.dataset.temp = "true";
    chatBody.appendChild(thinking);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.map((m) => ({
            role: m.from === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      const temps = chatBody.querySelectorAll('[data-temp="true"]');
      temps.forEach((n) => n.remove());

      if (!res.ok) {
        renderMessage(
          "I am having trouble reaching the assistant right now. Please try again later.",
          "bot"
        );
        return;
      }

      const data = await res.json();
      const reply =
        (data && data.reply) ||
        "I am here to help, but I could not get a response from the assistant.";

      renderMessage(reply, "bot");
      chatHistory.push({ from: "bot", text: reply });
    } catch (err) {
      console.error(err);
      const temps = chatBody.querySelectorAll('[data-temp="true"]');
      temps.forEach((n) => n.remove());
      renderMessage(
        "Sorry, I had trouble reaching the CyberGuardNG assistant. Please try again shortly.",
        "bot"
      );
    }
  });
});
