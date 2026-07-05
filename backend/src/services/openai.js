const OpenAI = require("openai");
const { PERSONAS } = require("../config/personas");

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set in .env");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// rough token estimate: 1 token ≈ 4 chars
function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

// keeps system prompt + as many recent messages as fit in token budget
function buildContextMessages(systemPrompt, messages, maxTokens = 6000) {
  let remainingBudget = maxTokens - estimateTokens(systemPrompt);

  const trimmedMessages = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(messages[i].content) + 10;
    if (remainingBudget - msgTokens < 0) break;
    trimmedMessages.unshift(messages[i]);
    remainingBudget -= msgTokens;
  }

  return [{ role: "system", content: systemPrompt }, ...trimmedMessages];
}

async function streamChatCompletion(res, personaId, messages) {
  const persona = PERSONAS[personaId];
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const client = getClient();
  const contextMessages = buildContextMessages(persona.systemPrompt, messages);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  let isDisconnected = false;
  res.on('close', () => {
    isDisconnected = true;
  });

  try {
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      messages: contextMessages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.85,
      presence_penalty: 0.1,
      frequency_penalty: 0.4,
    });

    for await (const chunk of stream) {
      if (isDisconnected) {
        break;
      }
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`);
      }

      const finishReason = chunk.choices[0]?.finish_reason;
      if (finishReason) {
        res.write(`data: ${JSON.stringify({ type: "done", finishReason })}\n\n`);
      }
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
  } finally {
    res.end();
  }
}

// non-streaming version, used for testing
async function chatCompletion(personaId, messages) {
  const persona = PERSONAS[personaId];
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const client = getClient();
  const contextMessages = buildContextMessages(persona.systemPrompt, messages);

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: contextMessages,
    max_tokens: 1024,
    temperature: 0.85,
    frequency_penalty: 0.4,
  });

  return completion.choices[0]?.message?.content || "";
}

module.exports = { streamChatCompletion, chatCompletion };