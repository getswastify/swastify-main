import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { resetConversation, voiceBook,  voiceTTS } from '../controller/ai.controller';


const router = Router();

router.post('/voice-book',requireAuthAndRole(['USER']), voiceBook);
router.post('/tts',requireAuthAndRole(['USER']), voiceTTS);
router.delete('/reset-conversation',requireAuthAndRole(['USER']), resetConversation);




export const aiRoutes =  router;