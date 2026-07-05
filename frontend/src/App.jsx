import { useState, useEffect } from "react";
import { useChat } from "./hooks/useChat";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./index.css";

export default function App() {
  const {
    activePersona,
    messages,
    isStreaming,
    error,
    clearError,
    switchPersona,
    sendMessage,
    clearHistory,
  } = useChat();

  // Desktop: sidebar visible by default; mobile: hidden by default
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Apply persona class to body for CSS variable switching
  useEffect(() => {
    document.body.classList.remove("persona-hitesh", "persona-piyush");
    document.body.classList.add(`persona-${activePersona}`);
    document.documentElement.classList.remove("persona-hitesh", "persona-piyush");
    document.documentElement.classList.add(`persona-${activePersona}`);
  }, [activePersona]);

  // Auto-dismiss error toast after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className={`app-layout persona-${activePersona}`}>
      {/* Sidebar */}
      <Sidebar
        activePersona={activePersona}
        onSwitchPersona={switchPersona}
        onClearHistory={clearHistory}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="main-area">
        {/* Header */}
        <ChatHeader
          activePersona={activePersona}
          messageCount={messages.length}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        {/* Messages */}
        <ChatWindow
          persona={activePersona}
          messages={messages}
          isStreaming={isStreaming}
          onSendMessage={sendMessage}
        />

        {/* Input */}
        <ChatInput
          persona={activePersona}
          onSend={sendMessage}
          isDisabled={isStreaming}
        />
      </main>

      {/* Mobile FAB */}
      <button
        className="mobile-sidebar-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        id="mobile-sidebar-fab"
      >
        🤖
      </button>

      {/* Error Toast */}
      {error && (
        <div
          className="error-toast"
          role="alert"
          onClick={clearError}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
