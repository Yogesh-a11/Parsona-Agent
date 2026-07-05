import { useEffect, useRef, useCallback, useState } from "react";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { PERSONAS } from "../constants/personas";

export default function ChatWindow({ persona, messages, isStreaming, onSendMessage }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isWelcome = messages.length === 0 && !isStreaming;
  const personaData = PERSONAS[persona];

  const shouldAutoScroll = useRef(true);
  // timestamp-based guard instead of a boolean that gets consumed by the
  // first scroll event of a smooth-scroll animation
  const programmaticScrollUntil = useRef(0);

  // drives the visible "jump to bottom" button (refs don't trigger re-renders)
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!bottomRef.current) return;
    // smooth scrolls fire many 'scroll' events over ~300-400ms; block the
    // whole window instead of just the next single event
    programmaticScrollUntil.current = Date.now() + (smooth ? 500 : 50);
    bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
    shouldAutoScroll.current = true;
    setShowJumpButton(false);
  }, []);

  // detect if user manually scrolled up -> disable auto-scroll + show button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (Date.now() < programmaticScrollUntil.current) return;

      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      const atBottom = distanceFromBottom < 80;

      shouldAutoScroll.current = atBottom;
      setShowJumpButton(!atBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // while streaming, follow along only if the user hasn't scrolled away.
  // instant (not smooth) so rapid token updates don't spawn overlapping
  // scroll animations that re-trigger the bug above.
  useEffect(() => {
    if (shouldAutoScroll.current) {
      scrollToBottom(false);
    }
  }, [messages, isStreaming, scrollToBottom]);

  // sending a new message should always snap to bottom and resume follow mode
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