import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { voiceBook, voiceTTS } from '../controller/ai.controller';


const router = Router();

router.post('/voice-book',requireAuthAndRole(['USER']), voiceBook);
router.post('/tts',requireAuthAndRole(['USER']), voiceTTS);



export const aiRoutes =  router;