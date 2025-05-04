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
exports.updateAppointmentStatus = exports.getDoctorAppointments = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const getDoctorAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!doctorId) {
            return res.status(400).json({
                status: false,
                message: 'Doctor ID is required.',
                error: 'Missing doctorId from request context.',
            });
        }
        const appointments = yield prismaConnection_1.prisma.appointment.findMany({
            where: { doctorId },
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
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No appointments found for this doctor.',
                error: 'No records available.',
            });
        }
        return res.status(200).json({
            status: true,
            message: 'Doctor appointments fetched successfully.',
            data: {
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
            },
        });
    }
    catch (error) {
        console.error('Error fetching doctor appointments:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while fetching the appointments.',
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
exports.getDoctorAppointments = getDoctorAppointments;
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const { appointmentId, status } = req.body;
        if (!appointmentId || !status) {
            return res.status(400).json({
                status: false,
                message: 'appointmentId and status are required.',
                error: 'Missing fields in request body.',
            });
        }
        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid status.',
                error: 'Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED',
            });
        }
        const appointment = yield prismaConnection_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment || appointment.doctorId !== doctorId) {
            return res.status(403).json({
                status: false,
                message: 'Not authorized to update this appointment.',
                error: 'Unauthorized access.',
            });
        }
        const updatedAppointment = yield prismaConnection_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });
        return res.status(200).json({
            status: true,
            message: 'Appointment status updated successfully.',
            data: {
                appointment: updatedAppointment,
            },
        });
    }
    catch (error) {
        console.error('Error updating appointment status:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while updating the appointment status.',
            error: error instanceof Error ? error.message : 'Internal server error',
        });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
