import { PERSONAS } from "../constants/personas";

export default function ChatHeader({ activePersona, messageCount, onToggleSidebar }) {
  const persona = PERSONAS[activePersona];

  return (
    <div className="chat-header">
      <div className="chat-header-persona">
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="toggle-sidebar-btn"
          style={{ marginRight: 8 }}
        >
          ☰
        </button>
        <div className={`header-avatar ${activePersona}`}>{persona.avatar}</div>
        <div>
          <div className="header-persona-name">{persona.name}</div>
          <div className="header-persona-status">
            {persona.statusText}
          </div>
        </div>
      </div>

      <div className="header-actions">
        {messageCount > 0 && (
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              alignSelf: "center",
              marginRight: 4,
            }}
          >
            {Math.ceil(messageCount / 2)} msg{messageCount > 2 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
