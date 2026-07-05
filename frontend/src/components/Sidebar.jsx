import { PERSONAS } from "../constants/personas";

export default function Sidebar({
  activePersona,
  onSwitchPersona,
  onClearHistory,
  isOpen,
  onClose,
}) {
  const currentPersona = PERSONAS[activePersona];

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="logo-icon">🤖</div>
            <div className="logo-text">
              <span>Parsona</span> Agent
            </div>
          </div>

          <div className="sidebar-label">Choose Your Mentor</div>
          <div className="persona-list">
            {Object.values(PERSONAS).map((persona) => (
              <button
                key={persona.id}
                id={`persona-btn-${persona.id}`}
                className={`persona-card ${persona.id} ${
                  activePersona === persona.id ? "active" : ""
                }`}
                onClick={() => onSwitchPersona(persona.id)}
              >
                <div className={`persona-avatar ${persona.id}`}>
                  {persona.avatar}
                  <span className="online-dot" />
                </div>
                <div className="persona-info">
                  <div className="persona-name">{persona.shortName}</div>
                  <div className="persona-tagline">{persona.tagline}</div>
                </div>
                {activePersona === persona.id && (
                  <div className="active-indicator" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-persona-info">
          <div className="persona-detail-card">
            <div
              className={`persona-avatar ${currentPersona.id}`}
              style={{ width: 52, height: 52, fontSize: 16, marginBottom: 12 }}
            >
              {currentPersona.avatar}
            </div>
            <h3>{currentPersona.name}</h3>
            <p>{currentPersona.description}</p>

            <div className="topics-section">
              <div className="topics-label">Expertise</div>
              <div className="topics-grid">
                {currentPersona.topics.map((topic) => (
                  <span key={topic} className="topic-chip">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              textAlign: "center",
              padding: "0 8px",
            }}
          >
            AI-powered chat using GPT-4o.
            <br />
            Responses simulate {currentPersona.shortName}&apos;s style.
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            id="new-chat-btn"
            className="new-chat-btn"
            onClick={onClearHistory}
          >
            ✨ New Conversation
          </button>
        </div>
      </aside>
    </>
  );
}
