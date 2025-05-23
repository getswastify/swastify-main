import { Request, Response } from "express";
import { setAuthContext } from "../ai-tools/authContext";
import { handleUserMessage } from "../ai-tools/agent";

export const voiceBook = async (req: Request, res: Response): Promise<any> => {
  const userInput = req.body.message;

  if (!userInput) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 👇 Wrap handleUserMessage in auth context
    const reply = await setAuthContext(authToken, () => handleUserMessage(userInput));

    res.json({ reply });
  } catch (err) {
    console.error('💥 Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
