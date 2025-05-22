import { agent } from "./core"

// Store messages with their auth tokens
const globalMessages: { role: "user" | "assistant"; content: string; auth_token?: string }[] = []

// Store the current auth token for tool execution
let currentAuthToken = ""

// Update the handleUserMessage function
export async function handleUserMessage(userInput: string, authToken: string): Promise<string> {
  if (!userInput) {
    throw new Error("Message is required")
  }

  // Store the auth token for tool execution
  currentAuthToken = authToken

  // Add the user message (without modifying it)
  globalMessages.push({
    role: "user",
    content: userInput,
    auth_token: authToken, // Store for reference, but AI won't use this directly
  })

  // Log the messages going to the LLM
  console.log("--- Input Messages to LLM ---")
  console.log(JSON.stringify(globalMessages, null, 2))
  console.log("Current auth token:", currentAuthToken)

  // Call the agent
  const response = await agent.invoke(
    {
      messages: globalMessages.map((msg) => ({ role: msg.role, content: msg.content })), // Only pass role and content
    },
    {
      configurable: {
        thread_id: authToken,
      },
    },
  )

  // Log the full response from the LLM/agent
  console.log("--- LLM Response ---")
  console.log(JSON.stringify(response, null, 2))

  // Extract latest assistant message
  const assistantMsg = response.messages[response.messages.length - 1]

  const assistantContent =
    typeof assistantMsg.content === "string"
      ? assistantMsg.content
      : Array.isArray(assistantMsg.content)
        ? assistantMsg.content.map((c: any) => (typeof c === "string" ? c : (c.text ?? ""))).join(" ")
        : ""

  // Push assistant reply
  globalMessages.push({
    role: "assistant",
    content: assistantContent,
  })

  return assistantContent
}

// Export the function to get the current auth token
export function getCurrentAuthToken(): string {
  return currentAuthToken
}
