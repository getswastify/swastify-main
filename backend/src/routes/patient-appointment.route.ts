import { Router } from 'express';
import { getAvailableAppointmentSlots, getAvailableDatesForMonth, getDynamicAppointmentSlots,bookAppointment } from '../controller/patient-appointment.controller';


const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);
router.get("/available-dates",  getAvailableDatesForMonth);
router.get("/available-slots",  getAvailableAppointmentSlots);
router.post("/book-appointment",  bookAppointment);




export const patientAppointmentRoutes =  router;