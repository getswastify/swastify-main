import { updateAppointmentStatus } from '../controller/doctor-appointment.controller';
import { getDoctorAppointments } from '../controller/doctor-appointment.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { Router } from 'express';

const router = Router();

router.get("/show-appointment",requireAuthAndRole('DOCTOR') , getDoctorAppointments);
router.put("/update-appointment-status",requireAuthAndRole('DOCTOR') , updateAppointmentStatus);

export const doctorAppointmentRoutes =  router;