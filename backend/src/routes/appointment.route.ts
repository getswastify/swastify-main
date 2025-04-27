import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { deleteAvailability, getDoctorAvailability, setDoctorAvailability, updateDoctorAvailability } from '../controller/appointment.controller';

const router = Router();

router.post('/doctor-availability',requireAuthAndRole('DOCTOR'), setDoctorAvailability);
router.put('/doctor-availability',requireAuthAndRole('DOCTOR'), updateDoctorAvailability);
router.get('/doctor-availability',requireAuthAndRole('DOCTOR'), getDoctorAvailability);
router.delete('/doctor-availability/:availabilityId',requireAuthAndRole('DOCTOR'), deleteAvailability);


export const appointmentRoutes =  router;