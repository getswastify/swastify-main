import { Request, Response } from "express";
import { handleUserMessage } from "../ai-tools/agent";



export const voiceBook = async (req:Request, res: Response) : Promise<any> => {
  const userInput = req.body.message;
  const userId = req.user?.userId;

  if (!userInput) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'Not Authenticated! User ID is required' });
  }

  try {
    const reply = await handleUserMessage(userInput,userId,);
    res.json({ reply });
  } catch (err) {
    console.error('💥 Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}