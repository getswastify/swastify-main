// src/core/agent.ts
import { agent } from "./core"


const threadId = "gundu-main-thread";

const globalMessages: { role: "user" | "assistant"; content: string }[] = [];

export async function handleUserMessage(userInput: string): Promise<string> {
  // Push user message
  globalMessages.push({ role: 'user', content: userInput });

  const response = await agent.invoke(
    {
      messages: globalMessages,
    },
    {
      configurable: {
        thread_id: threadId,
      },
    }
  );

  // Extract latest assistant message
  const assistantMsg = response.messages[response.messages.length - 1];

  const assistantContent =
    typeof assistantMsg.content === 'string'
      ? assistantMsg.content
      : Array.isArray(assistantMsg.content)
      ? assistantMsg.content.map((c: any) => (typeof c === 'string' ? c : c.text ?? '')).join(' ')
      : '';

  // Push assistant reply
  globalMessages.push({
    role: 'assistant',
    content: assistantContent,
  });

  return assistantContent;
}       