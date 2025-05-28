import { agent } from "./core"
import { getCurrentAuthToken } from "./authContext"
import { getUserId } from "../utils/getUserId";
import { prisma } from "../utils/prismaConnection";

const userConversations: Record<string, { messages: { role: "user" | "assistant"; content: string }[] }> = {}


export async function handleUserMessage(userInput: string): Promise<string> {
  if (!userInput) throw new Error("Message is required")

  const authToken = getCurrentAuthToken()
  const userId = getUserId(authToken)

  if (!userId) throw new Error("No userId found")

  // Fetch or init convo from DB
  type Message = { role: "user" | "assistant"; content: string };

  let convo = await prisma.conversation.findUnique({ where: { userId } })

  if (!convo) {
    convo = await prisma.conversation.create({
      data: {
        userId,
        messages: [],
      },
    })
  }

  // Ensure convo.messages is typed correctly
  const messagesArray: Message[] = Array.isArray(convo.messages)
    ? (convo.messages as Message[])
    : [];
  const updatedMessages: Message[] = [...messagesArray, {
    role: "user",
    content: userInput
  }]

  console.log(`--- LLM Input for User ${userId} ---`)
  console.log(JSON.stringify(updatedMessages, null, 2))

  // Convert messages to the expected BaseMessageLike[] format if needed
  const formattedMessages = updatedMessages.map(msg => msg ? ({
    role: msg.role,
    content: msg.content,
  }) : null).filter((msg): msg is { role: "user" | "assistant"; content: string } => msg !== null);

  const response = await agent.invoke(
    { messages: formattedMessages },
    {
      configurable: {
        thread_id: userId,
      },
    }
  )

  const assistantMsg = response.messages.at(-1)
  const assistantContent =
    assistantMsg && typeof assistantMsg.content === "string"
      ? assistantMsg.content
      : assistantMsg && Array.isArray(assistantMsg.content)
        ? assistantMsg.content.map((c: any) => (typeof c === "string" ? c : (c.text ?? ""))).join(" ")
        : ""

  updatedMessages.push({
    role: "assistant",
    content: assistantContent,
  })

  // Save updated convo
  await prisma.conversation.update({
    where: { userId },
    data: { messages: updatedMessages },
  })

  return assistantContent
}




export function getConversation(): { role: "user" | "assistant"; content: string }[] {
  const authToken = getCurrentAuthToken()
  return userConversations[authToken]?.messages ?? []
}
