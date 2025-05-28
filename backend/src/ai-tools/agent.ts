import { agent } from "./core"
import { getCurrentAuthToken } from "./authContext"
import { getUserId } from "../utils/getUserId";

const userConversations: Record<string, {
  messages: { role: "user" | "assistant"; content: string }[]
}> = {}

export async function handleUserMessage(userInput: string): Promise<string> {
  if (!userInput) throw new Error("Message is required")

  const authToken = getCurrentAuthToken()
  if (!authToken) throw new Error("Auth token not found in context")

  if (!userConversations[authToken]) {
    userConversations[authToken] = { messages: [] }
  }

  const userState = userConversations[authToken]

  userState.messages.push({
    role: "user",
    content: userInput,
  })

  console.log(`--- LLM Input for User ${authToken} ---`)
  console.log(JSON.stringify(userState.messages, null, 2))
  console.log(getUserId(authToken), "User ID from token")
  console.log("--- End LLM Input ---");
  

  const response = await agent.invoke(
    { messages: userState.messages },
    {
      configurable: {
        thread_id: getUserId(authToken), // still use token to separate convos
      },
    }
  )

  const assistantMsg = response.messages[response.messages.length - 1]
  const assistantContent =
    typeof assistantMsg.content === "string"
      ? assistantMsg.content
      : Array.isArray(assistantMsg.content)
        ? assistantMsg.content.map((c: any) => (typeof c === "string" ? c : (c.text ?? ""))).join(" ")
        : ""

  userState.messages.push({
    role: "assistant",
    content: assistantContent,
  })

  return assistantContent
}

export function getConversation(): { role: "user" | "assistant"; content: string }[] {
  const authToken = getCurrentAuthToken()
  return userConversations[authToken]?.messages ?? []
}
