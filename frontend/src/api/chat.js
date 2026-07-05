const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export async function streamChat({ personaId, messages, onDelta, onDone, onError }) {
  const controller = new AbortController();

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ personaId, messages }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === "delta" && event.content) {
              onDelta(event.content);
            } else if (event.type === "done") {
              onDone();
              return;
            } else if (event.type === "error") {
              onError(new Error(event.message || "Stream error"));
              return;
            }
          } catch {
            
          }
        }
      }
      onDone();
    };

    processStream().catch((err) => {
      if (err.name !== "AbortError") {
        onError(err);
      }
    });
  } catch (err) {
    if (err.name !== "AbortError") {
      onError(err);
    }
  }

  return () => controller.abort();
}

export async function fetchPersonas() {
  const res = await fetch(`${API_BASE}/personas`);
  if (!res.ok) throw new Error(`Failed to fetch personas: HTTP ${res.status}`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.ok;
}
