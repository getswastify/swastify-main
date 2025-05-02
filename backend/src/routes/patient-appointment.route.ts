import { Router } from 'express';
import { getAvailableAppointmentSlots, getAvailableDatesForMonth, getDynamicAppointmentSlots,bookAppointment, getPatientAppointments, searchDoctors } from '../controller/patient-appointment.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';


const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);
router.get("/available-dates",  getAvailableDatesForMonth);
router.get("/available-slots",  getAvailableAppointmentSlots);
router.get("/booked-appointment", requireAuthAndRole('USER'), getPatientAppointments);
router.get("/get-doctors", requireAuthAndRole('USER'), searchDoctors);
router.post("/book-appointment", requireAuthAndRole('USER'), bookAppointment);




export const patientAppointmentRoutes =  router;