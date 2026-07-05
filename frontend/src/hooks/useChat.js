import { useState, useCallback, useRef } from "react";
import { streamChat } from "../api/chat";

const INITIAL_HISTORIES = {
  hitesh: [],
  piyush: [],
};

export function useChat() {
  const [activePersona, setActivePersona] = useState("hitesh");
  const [histories, setHistories] = useState(INITIAL_HISTORIES);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const messages = histories[activePersona] || [];

  const switchPersona = useCallback((personaId) => {
    if (isStreaming) {
      abortRef.current?.();
      setIsStreaming(false);
    }
    setActivePersona(personaId);
    setError(null);
  }, [isStreaming]);

  const clearHistory = useCallback(() => {
    setHistories((prev) => ({
      ...prev,
      [activePersona]: [],
    }));
    setError(null);
  }, [activePersona]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const userMessage = { role: "user", content: content.trim() };
      const apiMessages = [...histories[activePersona], userMessage];

      // Single atomic update: add user message + empty assistant placeholder together
      // prevents the duplicate-message bug from two separate setState calls
      setHistories((prev) => ({
        ...prev,
        [activePersona]: [
          ...prev[activePersona],
          userMessage,
          { role: "assistant", content: "" },
        ],
      }));

      setIsStreaming(true);

      let streamedContent = "";

      const abort = await streamChat({
        personaId: activePersona,
        messages: apiMessages,
        onDelta: (delta) => {
          streamedContent += delta;
          setHistories((prev) => {
            const personaMsgs = [...prev[activePersona]];
            const lastIdx = personaMsgs.length - 1;
            if (personaMsgs[lastIdx]?.role === "assistant") {
              personaMsgs[lastIdx] = {
                ...personaMsgs[lastIdx],
                content: streamedContent,
              };
            }
            return { ...prev, [activePersona]: personaMsgs };
          });
        },
        onDone: () => {
          setIsStreaming(false);
          abortRef.current = null;
        },
        onError: (err) => {
          console.error("[Chat Error]", err);
          setError(err.message || "Something went wrong. Please try again.");
          setIsStreaming(false);
          setHistories((prev) => {
            const personaMsgs = prev[activePersona];
            const lastMsg = personaMsgs[personaMsgs.length - 1];
            if (lastMsg?.role === "assistant" && !lastMsg.content) {
              return {
                ...prev,
                [activePersona]: personaMsgs.slice(0, -1),
              };
            }
            return prev;
          });
          abortRef.current = null;
        },
      });

      abortRef.current = abort;
    },
    [activePersona, histories, isStreaming]
  );

  return {
    activePersona,
    messages,
    isStreaming,
    error,
    clearError: () => setError(null),
    switchPersona,
    sendMessage,
    clearHistory,
  };
}
