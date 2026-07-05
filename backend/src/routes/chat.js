const express = require("express");
const router = express.Router();
const { streamChatCompletion } = require("../services/openai");
const { PERSONAS } = require("../config/personas");
const { chatLimiter } = require("../middleware/rateLimit");

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "parsona-agent-backend",
  });
});

router.get("/personas", (req, res) => {
  const personaList = Object.values(PERSONAS).map(
    ({ id, name, shortName, tagline, description, avatar, accentColor, gradientFrom, gradientTo, topics }) => ({
      id,
      name,
      shortName,
      tagline,
      description,
      avatar,
      accentColor,
      gradientFrom,
      gradientTo,
      topics,
    })
  );
  res.json({ personas: personaList });
});

router.post("/chat", chatLimiter, async (req, res) => {
  const { personaId, messages } = req.body;

  if (!personaId) {
    return res.status(400).json({ error: "personaId is required" });
  }
  if (!PERSONAS[personaId]) {
    return res.status(400).json({
      error: `Invalid personaId. Valid options: ${Object.keys(PERSONAS).join(", ")}`,
    });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages must be a non-empty array" });
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return res.status(400).json({ error: "Each message must have 'role' and 'content' fields" });
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return res.status(400).json({ error: "Message role must be 'user' or 'assistant'" });
    }
  }

  try {
    await streamChatCompletion(res, personaId, messages);
  } catch (err) {
    if (!res.headersSent) {
      console.error("[Chat Route Error]", err.message);
      return res.status(500).json({
        error: "Failed to generate response",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
});

module.exports = router;