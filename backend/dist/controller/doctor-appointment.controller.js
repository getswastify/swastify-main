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
exports.getDoctorAppointments = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
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
