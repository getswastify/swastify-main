import * as dotenv from "dotenv";
dotenv.config();

import readlineSync from "readline-sync";
import axios from "axios";

// Your model info
const MODEL = "meta-llama/llama-3-8b-instruct";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY!;

async function askLlama(messages: any[]) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost", // Required by OpenRouter policy
          "X-Title": "SwastifyAgent",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err: any) {
    console.error("❌ Error from OpenRouter:", err.response?.data || err.message);
    return "Oops, something went wrong.";
  }
}

async function main() {
  console.log("🧠 Swastify AI Agent ready in terminal! Type 'exit' to stop.");

  const messages = [
    {
      role: "system",
      content: "You are a helpful healthcare assistant for the app Swastify. Keep your replies clear and simple.",
    },
  ];

  while (true) {
    const input = readlineSync.question("\n👤 You: ");
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    const reply = await askLlama(messages);
    console.log(`🤖 AI: ${reply}`);

    messages.push({ role: "assistant", content: reply });
  }
}

main();
