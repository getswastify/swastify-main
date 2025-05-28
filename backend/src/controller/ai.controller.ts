import { Request, Response } from "express";
import { setAuthContext } from "../ai-tools/authContext";
import { handleUserMessage } from "../ai-tools/agent";
import axios from "axios";
import { prisma } from "../utils/prismaConnection";

export const voiceBook = async (req: Request, res: Response): Promise<any> => {
  const userInput = req.body.message;

  if (!userInput) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 👇 Wrap handleUserMessage in auth context
    const reply = await setAuthContext(authToken, () =>
      handleUserMessage(userInput)
    );

    res.json({ reply });
  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const resetConversation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Reset the conversation for the user
    await prisma.conversation.deleteMany({
      where: { userId },
    });
    res.json({ message: "Conversation reset successfully" });
  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ error: "Failed to reset conversation" });
  }
};

export const voiceTTS = async (req: Request, res: Response): Promise<any> => {
  const { message, voice = "onyx" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const response = await axios.post(
      "https://shash-mb58ygyd-northcentralus.cognitiveservices.azure.com/openai/deployments/tts/audio/speech?api-version=2025-03-01-preview",
      {
        model: "tts",
        input: message,
        voice: voice,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AZURE_AI_FOUNDRY_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (err: any) {
    console.log(err);

    console.error("💥 Azure TTS Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "TTS generation failed" });
  }
};
