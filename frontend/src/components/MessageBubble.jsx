import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function TypingIndicator({ personaId }) {
  return (
    <div className="message-row">
      <div className={`message-avatar-sm ${personaId}`}>
        {personaId === "hitesh" ? "HC" : "PG"}
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

export function MessageBubble({ message, personaId, isLast }) {
  const isUser = message.role === "user";
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message-group`}>
      <div className={`message-row ${isUser ? "user" : "assistant"}`}>
        {!isUser && (
          <div className={`message-avatar-sm ${personaId}`}>
            {personaId === "hitesh" ? "HC" : "PG"}
          </div>
        )}

        <div
          className={`message-bubble ${isUser ? "user" : `assistant ${personaId}-bubble`}`}
        >
          {isUser ? (
            <p style={{ margin: 0 }}>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        fontSize: "12px",
                        margin: "8px 0",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {isUser && (
          <div className="message-avatar-sm user">👤</div>
        )}
      </div>
      {isLast && (
        <div className="message-time">{time}</div>
      )}
    </div>
  );
}
