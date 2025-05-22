import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { voiceBook } from '../controller/ai.controller';


const router = Router();

router.post('/voice-book',requireAuthAndRole(['USER']), voiceBook);


export const aiRoutes =  router;