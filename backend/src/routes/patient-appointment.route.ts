import { Router } from 'express';
import { getAvailableAppointmentSlots, getAvailableDatesForMonth, getDynamicAppointmentSlots,bookAppointment, getPatientAppointments, searchDoctors, cancelAppointment, getPatientAppointmentDetail } from '../controller/patient-appointment.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { getAppointmentDetails } from '../controller/doctor-appointment.controller';


const router = Router();


router.get("/get-appointmentslot",  getDynamicAppointmentSlots);
router.get("/available-dates",  getAvailableDatesForMonth);
router.post("/available-slots",  getAvailableAppointmentSlots);
router.get("/booked-appointment", requireAuthAndRole('USER'), getPatientAppointments);
router.get("/appointment-detail/:appointmentId", requireAuthAndRole('USER'), getPatientAppointmentDetail);
router.get("/get-doctors", requireAuthAndRole('USER'), searchDoctors);
router.post("/book-appointment", requireAuthAndRole('USER'), bookAppointment);
router.delete("/cancel-appointment/:appointmentId", requireAuthAndRole('USER'), cancelAppointment);





export const patientAppointmentRoutes =  router;