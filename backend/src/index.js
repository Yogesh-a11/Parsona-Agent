require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const chatRouter = require("./routes/chat");
const { generalLimiter } = require("./middleware/rateLimit");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // needed for SSE to work in some browsers
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    skip: (req) => req.url === "/api/health",
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", generalLimiter);

app.use("/api", chatRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    availableRoutes: ["GET /api/health", "GET /api/personas", "POST /api/chat"],
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Parsona Agent Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? "✅ configured" : "❌ MISSING - set in .env"}`);
  console.log(`\nAvailable routes:`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/personas`);
  console.log(`  POST http://localhost:${PORT}/api/chat\n`);
});