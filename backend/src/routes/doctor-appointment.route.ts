import { getDoctorAppointments } from '../controller/patient-appointment.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { Router } from 'express';

const router = Router();

router.get("/show-appointment",requireAuthAndRole('DOCTOR') , getDoctorAppointments);

export const doctorAppointmentRoutes =  router;