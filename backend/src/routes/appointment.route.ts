import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { getDoctorAvailability, setDoctorAvailability, updateDoctorAvailability } from '../controller/appointment.controller';

const router = Router();

router.post('/doctor-availability',requireAuthAndRole('DOCTOR'), setDoctorAvailability  );
router.put('/doctor-availability',requireAuthAndRole('DOCTOR'), updateDoctorAvailability   );
router.get('/doctor-availability',requireAuthAndRole('DOCTOR'), getDoctorAvailability   );


export const appointmentRoutes =  router;