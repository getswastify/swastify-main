"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRoutes = void 0;
const express_1 = require("express");
const appointment_controller_1 = require("../controller/appointment.controller");
const router = (0, express_1.Router)();
router.get("/get-appointmentslot", appointment_controller_1.getDynamicAppointmentSlots);
router.get("/available-dates", appointment_controller_1.getAvailableDatesForMonth);
exports.appointmentRoutes = router;
