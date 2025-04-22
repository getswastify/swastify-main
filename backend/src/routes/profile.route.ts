import { Router } from 'express';
import { createDoctorProfile, createHospitalProfile } from '../controller/profile.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';


const router = Router();

router.post('/doctor', requireAuthAndRole('DOCTOR'), createDoctorProfile);
router.post('/hospital', requireAuthAndRole('HOSPITAL'), createHospitalProfile);

export const profileRoutes =  router;