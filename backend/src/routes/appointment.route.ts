import { Router } from 'express';
import { getAvailableAppointmentSlots, getAvailableDatesForMonth, getDynamicAppointmentSlots } from '../controller/appointment.controller';

const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);
router.get("/available-dates",  getAvailableDatesForMonth);
router.get("/available-slots",  getAvailableAppointmentSlots);


export const appointmentRoutes =  router;