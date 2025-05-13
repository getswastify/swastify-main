import { Router } from 'express';
import { getDoctorSettings } from '../controller/settings.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';

const router = Router();

router.get('/doctor-settings',requireAuthAndRole(['DOCTOR']), getDoctorSettings);

export const settingsRoute =  router;