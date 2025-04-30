import { Router } from 'express';
import { getDynamicAppointmentSlots } from '../controller/appointment.controller';

const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);

export const appointmentRoutes =  router;