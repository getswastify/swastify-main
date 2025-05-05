"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.searchDoctors = exports.getPatientAppointments = exports.getDoctorAppointments = exports.bookAppointment = exports.getAvailableAppointmentSlots = exports.getAvailableDatesForMonth = exports.getDynamicAppointmentSlots = void 0;
const AppointmentUtils_1 = require("../helper/AppointmentUtils");
const prismaConnection_1 = require("../utils/prismaConnection");
const emailConnection_1 = require("../utils/emailConnection");
// API endpoint to get dynamic appointment slots for a doctor
const getDynamicAppointmentSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, dayOfWeek } = req.body;
        if (!doctorId || !dayOfWeek) {
            return res
                .status(400)
                .json({ error: "Doctor ID and dayOfWeek are required." });
        }
        // Step 1: Get doctor's availability for the given day
        const availability = yield (0, AppointmentUtils_1.getDoctorAvailabilityForDay)(doctorId, dayOfWeek);
        // Step 2: Generate dynamic slots for each availability period
        const generatedSlots = (0, AppointmentUtils_1.generateSlotsForAvailability)(availability);
        // Step 3: Check for conflicts in each generated slot
        const availableSlots = [];
        for (const slot of generatedSlots) {
            const conflict = yield (0, AppointmentUtils_1.checkForConflicts)(doctorId, slot);
            if (!conflict) {
                availableSlots.push(slot);
            }
        }
        return res.status(200).json({ availableSlots });
    }
    catch (error) {
        console.error("Error generating appointment slots:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while generating slots." });
    }
});
exports.getDynamicAppointmentSlots = getDynamicAppointmentSlots;
const getAvailableDatesForMonth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, year, month } = req.query;
        if (!doctorId || !year || !month) {
            return res
                .status(400)
                .json({ error: "doctorId, year, and month are required" });
        }
        // Convert year and month to numbers
        const parsedYear = parseInt(year);
        const parsedMonth = parseInt(month); // 1-indexed (e.g., May = 5)
        // Fetch doctor's availability (dayOfWeek field is important)
        const weeklyAvailability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: { doctorId: doctorId },
            select: { dayOfWeek: true },
            distinct: ["dayOfWeek"], // Just in case duplicates exist
        });
        if (!weeklyAvailability || weeklyAvailability.length === 0) {
            return res
                .status(404)
                .json({ error: "No availability found for the doctor." });
        }
        // Make a set of available weekdays (e.g., "Monday", "Wednesday")
        const availableWeekdays = new Set(weeklyAvailability.map((slot) => slot.dayOfWeek));
        // Get number of days in that month
        const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();
        const availableDates = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, day)); // UTC date
            const weekday = date.toLocaleDateString("en-US", {
                weekday: "long",
                timeZone: "UTC",
            }); // Force weekday in UTC
            if (availableWeekdays.has(weekday)) {
                availableDates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
            }
        }
        return res.status(200).json({ availableDates });
    }
    catch (error) {
        console.error("Error fetching available dates:", error);
        return res.status(500).json({ error: "Something went wrong." });
    }
});
exports.getAvailableDatesForMonth = getAvailableDatesForMonth;
// 👇 This helper merges the selected date with a time (in IST) and returns a UTC Date
const combineISTTimeWithDate = (date, hours, minutes) => {
    const [year, month, day] = date
        .toISOString()
        .split("T")[0]
        .split("-")
        .map(Number);
    const istDate = new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30)); // IST is UTC+5:30
    return istDate;
};
const getAvailableAppointmentSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, date } = req.body;
        if (!doctorId || !date) {
            return res.status(400).json({ error: "doctorId and date are required." });
        }
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "Asia/Kolkata",
        });
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: {
                doctorId,
                dayOfWeek,
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });
        if (!availability || availability.length === 0) {
            return res
                .status(404)
                .json({
                error: "No availability found for this doctor on the selected date.",
            });
        }
        const istStartOfDay = combineISTTimeWithDate(selectedDate, 0, 0);
        const istEndOfDay = combineISTTimeWithDate(selectedDate, 23, 59);
        const bookedAppointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentTime: {
                    gte: istStartOfDay,
                    lte: istEndOfDay,
                },
            },
            select: {
                appointmentTime: true,
            },
        });
        const bookedTimestamps = new Set(bookedAppointments.map((appt) => new Date(appt.appointmentTime).getTime()));
        // Current time in UTC with 1.5 hours added
        const now = new Date();
        const nowWithBuffer = new Date(now.getTime() + 90 * 60000); // 90 minutes = 1.5 hours
        const availableSlots = [];
        for (const slot of availability) {
            const startTimeIST = new Date(slot.startTime);
            const endTimeIST = new Date(slot.endTime);
            const startHour = startTimeIST.getHours();
            const startMinute = startTimeIST.getMinutes();
            const endHour = endTimeIST.getHours();
            const endMinute = endTimeIST.getMinutes();
            let slotStart = combineISTTimeWithDate(selectedDate, startHour, startMinute);
            let slotEnd = new Date(slotStart.getTime() + 30 * 60000);
            const finalSlotEnd = combineISTTimeWithDate(selectedDate, endHour, endMinute);
            while (slotEnd <= finalSlotEnd) {
                const isSlotBooked = bookedTimestamps.has(slotStart.getTime());
                const isInPast = slotStart.getTime() < nowWithBuffer.getTime();
                if (!isSlotBooked && !isInPast) {
                    availableSlots.push({
                        startTime: slotStart.toISOString(),
                        endTime: slotEnd.toISOString(),
                        displayTime: slotStart.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                        }),
                    });
                }
                slotStart = slotEnd;
                slotEnd = new Date(slotStart.getTime() + 30 * 60000);
            }
        }
        return res.status(200).json({ availableSlots });
    }
    catch (error) {
        console.error("Error fetching appointment slots:", error);
        return res
            .status(500)
            .json({
            error: "Something went wrong while fetching appointment slots.",
        });
    }
});
exports.getAvailableAppointmentSlots = getAvailableAppointmentSlots;
const bookAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId, doctorId, appointmentTime } = req.body;
        if (!patientId || !doctorId || !appointmentTime) {
            return res
                .status(400)
                .json({
                error: "patientId, doctorId, and appointmentTime are required.",
            });
        }
        const appointmentDate = new Date(appointmentTime);
        const weekday = appointmentDate.toLocaleString("en-US", {
            weekday: "long",
        });
        // Fetch all availabilities for that weekday
        const doctorAvailabilities = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: {
                doctorId,
                dayOfWeek: weekday,
            },
        });
        // Extract the time from appointmentDate (hours and minutes)
        const appointmentHours = appointmentDate.getHours();
        const appointmentMinutes = appointmentDate.getMinutes();
        const isWithinAvailability = doctorAvailabilities.some((slot) => {
            const slotStartHours = slot.startTime.getHours();
            const slotStartMinutes = slot.startTime.getMinutes();
            const slotEndHours = slot.endTime.getHours();
            const slotEndMinutes = slot.endTime.getMinutes();
            const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
            const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;
            const appointmentTotalMinutes = appointmentHours * 60 + appointmentMinutes;
            return (appointmentTotalMinutes >= slotStartTotalMinutes &&
                appointmentTotalMinutes < slotEndTotalMinutes);
        });
        if (!isWithinAvailability) {
            return res
                .status(400)
                .json({ error: "The doctor is not available at this time." });
        }
        const existingAppointment = yield prismaConnection_1.prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentTime: appointmentDate,
            },
        });
        if (existingAppointment) {
            return res
                .status(400)
                .json({ error: "The selected time slot is already booked." });
        }
        const newAppointment = yield prismaConnection_1.prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                appointmentTime: appointmentDate,
                status: "PENDING",
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        specialization: true,
                        consultationFee: true,
                    },
                },
            },
        });
        const appointmentDetails = {
            patientName: `${newAppointment.patient.firstName} ${newAppointment.patient.lastName}`,
            patientEmail: newAppointment.patient.email,
            patientPhone: newAppointment.patient.phone,
            appointmentTime: newAppointment.appointmentTime,
            status: newAppointment.status,
            doctorName: `${newAppointment.doctor.user.firstName} ${newAppointment.doctor.user.lastName}`,
            doctorSpecialization: newAppointment.doctor.specialization,
            doctorEmail: newAppointment.doctor.user.email,
            consultationFee: newAppointment.doctor.consultationFee,
        };
        try {
            // Send to patient
            yield (0, emailConnection_1.sendPatientAppointmentConfirmationEmail)(newAppointment.patient.email, appointmentDetails);
            console.log("Appointment confirmation email sent to patient:", newAppointment.patient.email);
            // Send to doctor
            yield (0, emailConnection_1.sendDoctorAppointmentPendingEmail)(newAppointment.doctor.user.email, appointmentDetails);
            console.log("Appointment confirmation email sent to doctor:", newAppointment.doctor.user.email);
        }
        catch (error) {
            console.error("Error sending appointment confirmation email:", error);
        }
        return res.status(201).json({
            message: "Appointment booked successfully.",
            appointment: newAppointment,
        });
    }
    catch (error) {
        console.error("Error booking appointment:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while booking the appointment." });
    }
});
exports.bookAppointment = bookAppointment;
const getDoctorAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Doctor's ID passed as URL parameter
        console.log(doctorId);
        // Validate the input
        if (!doctorId) {
            return res.status(400).json({ error: "doctorId is required." });
        }
        // Fetch appointments for the doctor, include related patient and doctor data
        const appointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                doctorId,
            },
            include: {
                patient: {
                    // Include patient details from the User model
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true, // Add any other fields you want to include
                    },
                },
                doctor: {
                    // Include doctor details from the DoctorProfile model
                    select: {
                        user: {
                            // Access User data for the doctor
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        specialization: true,
                    },
                },
            },
        });
        // Check if no appointments are found
        if (!appointments || appointments.length === 0) {
            return res
                .status(404)
                .json({ message: "No appointments found for this doctor." });
        }
        // Return the list of appointments with patient and doctor details
        return res.status(200).json({
            appointments: appointments.map((appointment) => ({
                appointmentId: appointment.id,
                patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                patientEmail: appointment.patient.email,
                patientPhone: appointment.patient.phone,
                appointmentTime: appointment.appointmentTime,
                status: appointment.status,
                doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
                doctorSpecialization: appointment.doctor.specialization,
                doctorEmail: appointment.doctor.user.email,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching doctor appointments:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while fetching the appointments." });
    }
});
exports.getDoctorAppointments = getDoctorAppointments;
const getPatientAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const patientId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId; // assumes user is logged in as a patient
        if (!patientId) {
            return res.status(400).json({ error: "Patient ID is required." });
        }
        const appointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                patientId,
            },
            orderBy: {
                appointmentTime: "asc",
            },
            include: {
                doctor: {
                    include: {
                        user: true, // to get doctor's name and email
                    },
                },
            },
        });
        if (appointments.length === 0) {
            return res
                .status(404)
                .json({ error: "No appointments found for this patient." });
        }
        // Format the response
        const formattedAppointments = appointments.map((appt) => ({
            appointmentId: appt.id,
            appointmentTime: appt.appointmentTime,
            status: appt.status,
            doctorName: `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`,
            doctorEmail: appt.doctor.user.email,
            doctorSpecialization: appt.doctor.specialization,
        }));
        return res.status(200).json({ appointments: formattedAppointments });
    }
    catch (error) {
        console.error("Error fetching patient appointments:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while fetching appointments." });
    }
});
exports.getPatientAppointments = getPatientAppointments;
const searchDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, specialty } = req.query;
        const doctors = yield prismaConnection_1.prisma.user.findMany({
            where: Object.assign({ role: "DOCTOR", doctorProfile: Object.assign({ status: "APPROVED" }, (specialty && {
                    specialization: {
                        contains: specialty,
                        mode: "insensitive",
                    },
                })) }, (search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            })),
            include: {
                doctorProfile: true,
            },
        });
        const formattedDoctors = doctors.map((doc) => {
            var _a, _b, _c;
            return ({
                id: doc.id,
                name: `${doc.firstName} ${doc.lastName}`,
                specialty: ((_a = doc.doctorProfile) === null || _a === void 0 ? void 0 : _a.specialization) || "",
                experience: new Date().getFullYear() -
                    new Date((_c = (_b = doc.doctorProfile) === null || _b === void 0 ? void 0 : _b.startedPracticeOn) !== null && _c !== void 0 ? _c : new Date()).getFullYear(),
            });
        });
        return res.status(200).json({ doctors: formattedDoctors });
    }
    catch (error) {
        console.error("Error searching doctors:", error);
        return res
            .status(500)
            .json({ error: "Something went wrong while searching for doctors." });
    }
});
exports.searchDoctors = searchDoctors;
const cancelAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const patientId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
        const { appointmentId } = req.params;
        if (!appointmentId) {
            return res.status(400).json({ error: "Appointment ID is required." });
        }
        // Check if the appointment exists and belongs to this patient
        const appointment = yield prismaConnection_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }
        if (appointment.patientId !== patientId) {
            return res
                .status(403)
                .json({ error: "You are not authorized to cancel this appointment." });
        }
        // Update the appointment status to CANCELLED
        yield prismaConnection_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: "CANCELLED",
            },
        });
        return res
            .status(200)
            .json({ message: "Appointment cancelled successfully 🚫" });
    }
    catch (error) {
        console.error("Error cancelling appointment:", error);
        return res
            .status(500)
            .json({
            error: "Something went wrong while cancelling the appointment.",
        });
    }
});
exports.cancelAppointment = cancelAppointment;
