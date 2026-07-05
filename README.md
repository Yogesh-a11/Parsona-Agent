# Parsona Agent 🤖☕

> AI-powered chat app simulating conversations with **Hitesh Choudhary** and **Piyush Garg** — India's top coding educators.

![Built with React + Node.js + OpenAI GPT-4o](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20OpenAI-blueviolet)

---

## ✨ Features

- 🎭 **Dual Persona Chat** — Switch between Hitesh Choudhary and Piyush Garg
- ⚡ **Real-time Streaming** — GPT-4o responses stream word-by-word via SSE
- 🧠 **Context Management** — Sliding window keeps conversation coherent
- 💅 **Premium Dark UI** — Glassmorphism, persona-color theming, smooth animations
- 📱 **Responsive** — Works on desktop and mobile
- 🔒 **Production-ready** — Rate limiting, helmet security, CORS, error handling
- 🖥️ **Code Highlighting** — Syntax-highlighted code blocks in chat

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- An **OpenAI API key** (GPT-4o access required)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Edit backend/.env
OPENAI_API_KEY=sk-your-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend starts at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend starts at: `http://localhost:5173`

Open your browser at **http://localhost:5173** 🎉

---

## 🏗️ Architecture

```
parsona-agent/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── personas.js     # System prompts for each persona
│   │   ├── middleware/
│   │   │   ├── rateLimit.js    # API rate limiting
│   │   │   └── errorHandler.js # Centralized error handling
│   │   ├── routes/
│   │   │   └── chat.js         # POST /api/chat, GET /api/personas
│   │   ├── services/
│   │   │   └── openai.js       # OpenAI streaming wrapper
│   │   └── index.js            # Express entry point
│   └── .env                    # ← Put your API key here
│
└── frontend/                   # React + Vite
    └── src/
        ├── api/chat.js         # SSE streaming client
        ├── hooks/useChat.js    # Chat state management
        ├── components/         # UI components
        └── constants/personas.js
```

---

## 📖 Documentation

### Persona Data Collection

Both personas were researched using:
- **YouTube videos** — Watching hours of content to identify speech patterns, vocabulary, and teaching style
- **Twitter/X posts** — Analyzing tone, opinions, and how they engage with the developer community
- **Website content** — hitesh.ai, piyushgarg.dev, chaicode.com, teachyst.com
- **GitHub activity** — Understanding technical areas of focus
- **Live stream transcripts** — Capturing natural speech patterns

### Prompt Engineering Strategy

Each persona uses a **rich system prompt** with:

1. **Identity declaration** — Who the person is, their background, achievements
2. **Communication style** — Tone, language mix, formality level
3. **Signature phrases** — Actual phrases they use (e.g., Hitesh's "Haan ji!", "Chalte hain")
4. **Teaching approach** — Analogies, structure, depth of explanation
5. **Topic expertise** — Areas they cover and their perspectives
6. **Philosophy** — Their core beliefs about learning and development
7. **Response format** — Length, emoji usage, code examples

**Hitesh Choudhary** system prompt captures:
- Hinglish (Hindi-English mix) natural code-switching
- Chai references and warm "big brother" energy
- Relatable analogies for complex concepts
- Encouragement for beginners

**Piyush Garg** system prompt captures:
- Clear, structured English with occasional Hindi
- "So basically..." and "Let me explain" openers
- Deep-dive technical explanations
- Production/scale mindset

### Context Management

- **Sliding window**: Keeps system prompt + last 6,000 tokens of conversation
- **Token estimation**: ~4 characters per token (rough estimate)
- **Per-persona history**: Each persona maintains its own independent conversation
- **Frontend state**: Full history stored in React state (`useChat` hook)
- **Backend processing**: Receives full history, trims to fit context window

---

## 🧪 Sample Conversations

### Hitesh Choudhary

**User:** JavaScript kaise seekhun shuru se?

**Hitesh:** Haan bhai! Bahut badiya sawaal hai yeh! 🍵

JavaScript seekhne ke liye, main suggest karunga ki pehle basics pakad lo:

1. **Variables** — `var`, `let`, `const` mein kya difference hai
2. **Functions** — regular functions, arrow functions
3. **Arrays aur Objects** — yeh bahut kaam aate hain

Dekho, JavaScript bahut forgiving language hai beginners ke liye. Aur seedha bolta hoon — browser console hi tera best friend hai shuru mein!

ChaiCode pe hamara complete JavaScript playlist hai, ekdum free — wahan se shuru karo. Aur haan, consistency rakhna. Roz thoda thoda karo, ek mahine mein tu confident ho jaayega! 💪

Chalte hain? Koi specific topic hai jo samajhna chahte ho?

---

### Piyush Garg

**User:** How does Node.js event loop work?

**Piyush:** Great question. So basically, the Node.js event loop is the core mechanism that allows Node to handle thousands of concurrent connections despite being single-threaded.

Here's how it works:

**The Phases (in order):**
1. **Timers** — Executes `setTimeout` and `setInterval` callbacks
2. **Pending callbacks** — I/O callbacks deferred from previous iteration
3. **Idle/Prepare** — Internal use only
4. **Poll** — Retrieve new I/O events; execute I/O callbacks
5. **Check** — `setImmediate` callbacks
6. **Close callbacks** — e.g., `socket.on('close', ...)`

The key insight here is that Node offloads heavy I/O operations to **libuv** (the C++ library underneath), which uses a thread pool. So when you do a file read, Node delegates that to libuv, continues executing other code, and when the file read completes, the callback gets queued back into the event loop.

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

Does that make sense? The microtask queue (Promises) always gets processed before the next event loop phase, which is why `3` comes before `2` here.

---

## 📦 API Reference

### `POST /api/chat`
Streams a chat response.

**Request body:**
```json
{
  "personaId": "hitesh",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:** `text/event-stream` (SSE)
```
data: {"type":"delta","content":"Haan"}
data: {"type":"delta","content":" bhai!"}
data: {"type":"done","finishReason":"stop"}
```

### `GET /api/personas`
Returns persona metadata.

### `GET /api/health`
Health check.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| AI | OpenAI GPT-4o (streaming) |
| Frontend | React 18, Vite |
| Styling | Vanilla CSS (design system) |
| Markdown | react-markdown, remark-gfm |
| Code Highlighting | react-syntax-highlighter |
| Security | Helmet, express-rate-limit, CORS |
| Logging | Morgan |

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | **required** |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

---

## 📄 License

MIT — Built for learning and demonstration purposes.

> **Disclaimer:** This app simulates personas based on publicly available content. Responses are AI-generated and do not represent the actual opinions of Hitesh Choudhary or Piyush Garg.
