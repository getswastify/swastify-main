"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorAppointmentRoutes = void 0;
const patient_appointment_controller_1 = require("../controller/patient-appointment.controller");
const requireAuthAndRole_1 = require("../middleware/requireAuthAndRole");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/show-appointment", (0, requireAuthAndRole_1.requireAuthAndRole)('DOCTOR'), patient_appointment_controller_1.getDoctorAppointments);
exports.doctorAppointmentRoutes = router;
