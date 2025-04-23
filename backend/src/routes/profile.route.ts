import { Router } from 'express';
import { createDoctorProfile, createHospitalProfile, createPatientProfile } from '../controller/profile.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';


const router = Router();

router.post('/patient', requireAuthAndRole('USER'), createPatientProfile);
router.post('/doctor', requireAuthAndRole('DOCTOR'), createDoctorProfile);
router.post('/hospital', requireAuthAndRole('HOSPITAL'), createHospitalProfile);

export const profileRoutes =  router;