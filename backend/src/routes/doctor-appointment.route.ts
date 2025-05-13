import { connectGoogleCalendar, getAppointmentDetails, googleCalendarCallback, updateAppointmentStatus } from '../controller/doctor-appointment.controller';
import { getDoctorAppointments } from '../controller/doctor-appointment.controller';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { Router } from 'express';

const router = Router();

router.get("/show-appointment",requireAuthAndRole(['DOCTOR']) , getDoctorAppointments);
router.get("/appointment-details/:appointmentId",requireAuthAndRole(['DOCTOR']) , getAppointmentDetails);
router.put("/update-appointment-status",requireAuthAndRole(['DOCTOR']) , updateAppointmentStatus);
router.get("/calendar-connect",requireAuthAndRole(['DOCTOR']) , connectGoogleCalendar);
router.get("/calendar-callback",requireAuthAndRole(['DOCTOR']) , googleCalendarCallback);


export const doctorAppointmentRoutes =  router;