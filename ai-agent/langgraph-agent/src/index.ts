import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { handleUserMessage } from './core/agent';


const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/message', async (req, res) : Promise<any> => {
  const userInput = req.body.message;

  if (!userInput) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await handleUserMessage(userInput);
    res.json({ reply });
  } catch (err) {
    console.error('💥 Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gundu is live at http://localhost:${PORT}`);
});
