import { agent } from "./core";
import { getCurrentAuthToken } from "./authContext";
import { getUserId } from "../utils/getUserId";

// In-memory convo store per session (auth token based)
const userConversations: Record<string, { messages: { role: "user" | "assistant"; content: string }[] }> = {};

export async function handleUserMessage(userInput: string): Promise<string> {
  if (!userInput) throw new Error("Message is required");

  const authToken = getCurrentAuthToken();
  const userId = getUserId(authToken);
  if (!userId) throw new Error("No userId found");

  // Init convo if not there
  if (!userConversations[authToken]) {
    userConversations[authToken] = { messages: [] };
  }

  const sessionMessages = userConversations[authToken].messages;

  // Add user message to convo
  sessionMessages.push({
    role: "user",
    content: userInput,
  });

  console.log(`--- LLM Input for User ${userId} ---`);
  console.log(JSON.stringify(sessionMessages, null, 2));

  const response = await agent.invoke(
    { messages: sessionMessages },
    {
      configurable: {
        thread_id: userId,
      },
    }
  );

  const assistantMsg = response.messages.at(-1);
  const assistantContent =
    assistantMsg && typeof assistantMsg.content === "string"
      ? assistantMsg.content
      : assistantMsg && Array.isArray(assistantMsg.content)
        ? assistantMsg.content.map((c: any) => (typeof c === "string" ? c : (c.text ?? ""))).join(" ")
        : "";

  // Add assistant reply to convo
  sessionMessages.push({
    role: "assistant",
    content: assistantContent,
  });

  return assistantContent;
}

export function getConversation(): { role: "user" | "assistant"; content: string }[] {
  const authToken = getCurrentAuthToken();
  return userConversations[authToken]?.messages ?? [];
}
