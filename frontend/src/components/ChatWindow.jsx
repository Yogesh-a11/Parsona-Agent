import { useEffect, useRef, useCallback, useState } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { PERSONAS } from "../constants/personas";

export default function ChatWindow({ persona, messages, isStreaming, onSendMessage }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isWelcome = messages.length === 0 && !isStreaming;
  const personaData = PERSONAS[persona];

  const shouldAutoScroll = useRef(true);
  const lastScrollTop = useRef(0);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    shouldAutoScroll.current = true;
    setShowJumpButton(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // If user scrolled UP, immediately disable auto-scroll
      if (currentScrollTop < lastScrollTop.current - 2) {
        shouldAutoScroll.current = false;
        setShowJumpButton(true);
      }

      // If user scrolled to the very bottom, re-enable auto-scroll
      const distanceFromBottom =
        container.scrollHeight - currentScrollTop - container.clientHeight;
      if (distanceFromBottom < 15) {
        shouldAutoScroll.current = true;
        setShowJumpButton(false);
      }

      lastScrollTop.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      scrollToBottom(false);
    }
  }, [messages, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "user") {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  return (
    <div className="messages-container" ref={containerRef} style={{ position: "relative" }}>
      {isWelcome ? (
        <div className="welcome-screen">
          <div className={`welcome-avatar ${persona}`}>
            {personaData.avatar}
          </div>

          <div>
            <h1 className="welcome-title">
              Chat with <span>{personaData.shortName}</span>
            </h1>
            <p className="welcome-subtitle">
              {personaData.description}
            </p>
          </div>

          <div className="welcome-prompts">
            {personaData.welcomePrompts.map((prompt) => (
              <button
                key={prompt}
                className="prompt-chip"
                onClick={() => onSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            💬 {personaData.statusText}
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, idx) => {
            const isLastMsg = idx === messages.length - 1;
            if (isLastMsg && isStreaming && msg.role === "assistant" && !msg.content) {
              return null;
            }
            return (
              <MessageBubble
                key={msg.id ?? idx}
                message={msg}
                personaId={persona}
                isLast={isLastMsg}
              />
            );
          })}

          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role === "assistant" &&
            !messages[messages.length - 1]?.content && (
              <TypingIndicator personaId={persona} />
            )}
        </>
      )}

      <div ref={bottomRef} />

      {showJumpButton && (
        <button
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom(true)}
          aria-label="Scroll to latest message"
        >
          ↓
        </button>
      )}
    </div>
  );
}