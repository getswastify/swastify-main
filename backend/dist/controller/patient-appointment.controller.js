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
exports.searchDoctors = exports.getPatientAppointments = exports.getDoctorAppointments = exports.bookAppointment = exports.getAvailableAppointmentSlots = exports.getAvailableDatesForMonth = exports.getDynamicAppointmentSlots = void 0;
const AppointmentUtils_1 = require("../helper/AppointmentUtils");
const prismaConnection_1 = require("../utils/prismaConnection");
const emailConnection_1 = require("../utils/emailConnection");
// API endpoint to get dynamic appointment slots for a doctor
const getDynamicAppointmentSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, dayOfWeek } = req.body;
        if (!doctorId || !dayOfWeek) {
            return res.status(400).json({ error: 'Doctor ID and dayOfWeek are required.' });
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
        console.error('Error generating appointment slots:', error);
        return res.status(500).json({ error: 'Something went wrong while generating slots.' });
    }
});
exports.getDynamicAppointmentSlots = getDynamicAppointmentSlots;
const getAvailableDatesForMonth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, year, month } = req.body;
        if (!doctorId || !year || !month) {
            return res.status(400).json({ error: "doctorId, year, and month are required" });
        }
        // Fetch doctor's weekly availability (days of week)
        const weeklyAvailability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: { doctorId },
            select: { dayOfWeek: true },
        });
        if (!weeklyAvailability || weeklyAvailability.length === 0) {
            return res.status(404).json({ error: "No availability found for the doctor." });
        }
        const availableWeekdays = new Set(weeklyAvailability.map(slot => slot.dayOfWeek));
        console.log("Available weekdays for doctor:", availableWeekdays); // Debugging log
        const daysInMonth = new Date(year, month, 0).getDate(); // Get last day of the month
        const availableDates = [];
        console.log(`Days in month: ${daysInMonth}`); // Debugging line to check the days in the month
        // Loop through each day of the month and check if it's an available day
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day); // JS months are 0-indexed
            const weekday = date.toLocaleDateString("en-US", { weekday: "long" }); // Get correct weekday in local timezone
            console.log(`Checking date: ${date.toString()} (Weekday: ${weekday})`); // Debugging line
            // Check if this weekday is available for the doctor
            if (availableWeekdays.has(weekday)) {
                console.log(`Date ${date.toLocaleDateString("en-CA")} is available.`); // Debug log when the date is available
                availableDates.push(date.toLocaleDateString("en-CA")); // Push date in "YYYY-MM-DD" format
            }
            else {
                console.log(`Date ${date.toLocaleDateString("en-CA")} is NOT available.`); // Debug log when the date is NOT available
            }
        }
        console.log(`Available dates: ${availableDates}`); // Final list of available dates
        return res.status(200).json({ availableDates });
    }
    catch (error) {
        console.error("Error fetching available dates:", error);
        return res.status(500).json({ error: "Something went wrong." });
    }
});
exports.getAvailableDatesForMonth = getAvailableDatesForMonth;
const getAvailableAppointmentSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, date } = req.body;
        if (!doctorId || !date) {
            return res.status(400).json({ error: 'doctorId and date are required.' });
        }
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
        // 1. Fetch doctor availability
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: {
                doctorId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        if (!availability || availability.length === 0) {
            return res.status(404).json({ error: 'No availability found for this doctor on the selected date.' });
        }
        // 2. Fetch already booked appointments for the doctor on that day
        const bookedAppointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                doctorId,
                appointmentTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: {
                appointmentTime: true,
            },
        });
        const bookedTimestamps = new Set(bookedAppointments.map((appt) => new Date(appt.appointmentTime).getTime()));
        // 3. Generate 30-minute slots, skipping booked ones
        const availableSlots = [];
        for (const slot of availability) {
            let currentStartTime = new Date(slot.startTime);
            let currentEndTime = new Date(currentStartTime);
            currentEndTime.setMinutes(currentEndTime.getMinutes() + 30);
            while (currentEndTime <= slot.endTime) {
                if (!bookedTimestamps.has(currentStartTime.getTime())) {
                    availableSlots.push({
                        startTime: currentStartTime.toISOString(),
                        endTime: currentEndTime.toISOString(),
                    });
                }
                currentStartTime = new Date(currentEndTime);
                currentEndTime = new Date(currentStartTime);
                currentEndTime.setMinutes(currentEndTime.getMinutes() + 30);
            }
        }
        return res.status(200).json({ availableSlots });
    }
    catch (error) {
        console.error('Error fetching appointment slots:', error);
        return res.status(500).json({ error: 'Something went wrong while fetching appointment slots.' });
    }
});
exports.getAvailableAppointmentSlots = getAvailableAppointmentSlots;
const bookAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId, doctorId, appointmentTime } = req.body;
        // Validate the input
        if (!patientId || !doctorId || !appointmentTime) {
            return res.status(400).json({ error: 'patientId, doctorId, and appointmentTime are required.' });
        }
        // Convert appointment time to Date object
        const appointmentDate = new Date(appointmentTime);
        // 1. Check if the doctor has availability at the requested time
        const doctorAvailability = yield prismaConnection_1.prisma.doctorAvailability.findFirst({
            where: {
                doctorId,
                startTime: {
                    lte: appointmentDate, // Check if the requested appointment time is after the start time
                },
                endTime: {
                    gte: appointmentDate, // Check if the requested appointment time is before the end time
                },
                dayOfWeek: appointmentDate.toLocaleString('en-US', { weekday: 'long' }), // Ensure it's on a day the doctor is available
            },
        });
        if (!doctorAvailability) {
            return res.status(400).json({ error: 'The doctor is not available at this time.' });
        }
        // 2. Check if the time slot is already booked
        const existingAppointment = yield prismaConnection_1.prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentTime: appointmentDate,
            },
        });
        if (existingAppointment) {
            return res.status(400).json({ error: 'The selected time slot is already booked.' });
        }
        // 3. Create the new appointment
        const newAppointment = yield prismaConnection_1.prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                appointmentTime: appointmentDate,
                status: 'PENDING', // Appointment is booked but not yet confirmed
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
                    },
                },
            },
        });
        // 4. Prepare appointment details directly
        const appointmentDetails = {
            patientName: `${newAppointment.patient.firstName} ${newAppointment.patient.lastName}`,
            patientEmail: newAppointment.patient.email,
            patientPhone: newAppointment.patient.phone,
            appointmentTime: newAppointment.appointmentTime,
            status: newAppointment.status,
            doctorName: `${newAppointment.doctor.user.firstName} ${newAppointment.doctor.user.lastName}`,
            doctorSpecialization: newAppointment.doctor.specialization,
            doctorEmail: newAppointment.doctor.user.email,
        };
        // 5. Send appointment confirmation email to the patient
        try {
            yield (0, emailConnection_1.sendAppointmentConfirmationEmail)(newAppointment.patient.email, appointmentDetails); // Send email
            console.log('Appointment confirmation email sent to:', newAppointment.patient.email);
        }
        catch (error) {
            console.error('Error sending appointment confirmation email:', error);
        }
        // 6. Respond with the appointment details
        return res.status(201).json({
            message: 'Appointment booked successfully.',
            appointment: newAppointment,
        });
    }
    catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ error: 'Something went wrong while booking the appointment.' });
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
            return res.status(400).json({ error: 'doctorId is required.' });
        }
        // Fetch appointments for the doctor, include related patient and doctor data
        const appointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                doctorId,
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true, // Add any other fields you want to include
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
                    },
                },
            },
        });
        // Check if no appointments are found
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor.' });
        }
        // Return the list of appointments with patient and doctor details
        return res.status(200).json({
            appointments: appointments.map(appointment => ({
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
        console.error('Error fetching doctor appointments:', error);
        return res.status(500).json({ error: 'Something went wrong while fetching the appointments.' });
    }
});
exports.getDoctorAppointments = getDoctorAppointments;
const getPatientAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const patientId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId; // assumes user is logged in as a patient
        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID is required.' });
        }
        const appointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: {
                patientId,
            },
            orderBy: {
                appointmentTime: 'asc',
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
            return res.status(404).json({ error: 'No appointments found for this patient.' });
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
        console.error('Error fetching patient appointments:', error);
        return res.status(500).json({ error: 'Something went wrong while fetching appointments.' });
    }
});
exports.getPatientAppointments = getPatientAppointments;
const searchDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, specialty } = req.query;
        const doctors = yield prismaConnection_1.prisma.user.findMany({
            where: Object.assign({ role: 'DOCTOR', doctorProfile: Object.assign({ status: 'APPROVED' }, (specialty && {
                    specialization: {
                        contains: specialty,
                        mode: 'insensitive',
                    },
                })) }, (search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ],
            })),
            include: {
                doctorProfile: true,
            },
        });
        const formattedDoctors = doctors.map((doc) => {
            var _a, _b, _c, _d;
            return ({
                id: ((_a = doc.doctorProfile) === null || _a === void 0 ? void 0 : _a.id) || '',
                name: `${doc.firstName} ${doc.lastName}`,
                specialty: ((_b = doc.doctorProfile) === null || _b === void 0 ? void 0 : _b.specialization) || '',
                experience: new Date().getFullYear() - new Date((_d = (_c = doc.doctorProfile) === null || _c === void 0 ? void 0 : _c.startedPracticeOn) !== null && _d !== void 0 ? _d : new Date()).getFullYear(),
            });
        });
        return res.status(200).json({ doctors: formattedDoctors });
    }
    catch (error) {
        console.error('Error searching doctors:', error);
        return res.status(500).json({ error: 'Something went wrong while searching for doctors.' });
    }
});
exports.searchDoctors = searchDoctors;
