import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { getApprovedDoctors, getPublicDoctorAvailability } from '../controller/appointment.controller';


const router = Router();


router.get('/get-doctors',requireAuthAndRole('DOCTOR'), getApprovedDoctors);
router.get('/get-doctor-availbility/:doctorId',getPublicDoctorAvailability );

export const appointmentRoutes =  router;   