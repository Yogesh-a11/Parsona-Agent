import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, isDisabled, persona }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  // auto-resize textarea as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const placeholder =
    persona === "hitesh"
      ? "Hitesh bhai se kuch poocho... (chai ho jaaye? ☕)"
      : "Ask Piyush about backend, infra, or GenAI...";

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="chat-textarea"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          rows={1}
          aria-label="Type your message"
        />
        <button
          id="send-btn"
          className="send-btn"
          onClick={handleSend}
          disabled={isDisabled || !value.trim()}
          aria-label="Send message"
        >
          {isDisabled ? "⏳" : "➤"}
        </button>
      </div>
      <p className="input-hint">
        Press <kbd style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>Enter</kbd> to send •{" "}
        <kbd style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}
