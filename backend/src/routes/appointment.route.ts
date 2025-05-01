import { Router } from 'express';
import { getAvailableDatesForMonth, getDynamicAppointmentSlots } from '../controller/appointment.controller';

const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);
router.get("/available-dates",  getAvailableDatesForMonth);

export const appointmentRoutes =  router;