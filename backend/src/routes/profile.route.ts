import { Router } from 'express';
import { createDoctorProfile, createHospitalProfile, createPatientProfile, updateDoctorProfile, updateHospitalProfile, updatePatientProfile } from '../controller/profile.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';


const router = Router();

router.post('/patient', requireAuthAndRole('USER'), createPatientProfile);
router.post('/doctor', requireAuthAndRole('DOCTOR'), createDoctorProfile);
router.post('/hospital', requireAuthAndRole('HOSPITAL'), createHospitalProfile);

router.patch('/patient', requireAuthAndRole('USER'), updatePatientProfile);
router.patch('/doctor', requireAuthAndRole('DOCTOR'), updateDoctorProfile);
router.patch('/hospital', requireAuthAndRole('HOSPITAL'), updateHospitalProfile);

export const profileRoutes =  router;