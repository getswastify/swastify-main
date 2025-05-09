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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentStatus = exports.getDoctorAppointments = exports.googleCalendarCallback = exports.connectGoogleCalendar = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const emailConnection_1 = require("../utils/emailConnection");
const googleMeet_1 = require("../utils/googleMeet");
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/doctor/calendar-callback");
const connectGoogleCalendar = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const scopes = [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email", // ✅ added this so we can fetch email
        ];
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: scopes,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
        return res.status(200).json({
            status: true,
            url,
            message: "Redirect to Google Calendar connect",
        });
    }
    catch (error) {
        console.error("❌ Error generating Google OAuth URL:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to generate Google Calendar connection URL.",
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
exports.connectGoogleCalendar = connectGoogleCalendar;
// Step 2: Handle OAuth2 callback and save tokens
const googleCalendarCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({
            status: false,
            message: "Authorization code missing from request.",
        });
    }
    try {
        console.log("📥 Received code:", code);
        // Get tokens using the code
        const { tokens } = yield oauth2Client.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
        oauth2Client.setCredentials(tokens); // ✅ set credentials FIRST before making requests
        // Get Google user info using oauth2 API
        const oauth2 = googleapis_1.google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfoResponse = yield oauth2.userinfo.get();
        const email = userInfoResponse.data.email;
        console.log("📧 Google Email:", email);
        // Extract doctor ID from auth middleware
        const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        console.log("🧑‍⚕️ Doctor ID:", doctorId);
        if (!doctorId) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized. No doctor ID found.",
            });
        }
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: doctorId },
        });
        if (!doctorProfile) {
            return res.status(404).json({
                status: false,
                message: "Doctor profile not found.",
            });
        }
        // Save tokens and email to DB
        yield prismaConnection_1.prisma.doctorProfile.update({
            where: { userId: doctorId },
            data: {
                googleAccessToken: (_b = tokens.access_token) !== null && _b !== void 0 ? _b : null,
                googleRefreshToken: (_c = tokens.refresh_token) !== null && _c !== void 0 ? _c : null,
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                googleEmail: email !== null && email !== void 0 ? email : null,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Google Calendar connected successfully.",
        });
    }
    catch (error) {
        console.error("❌ Callback error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to connect Google Calendar.",
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
exports.googleCalendarCallback = googleCalendarCallback;
// Get Doctor Appointments
const getDoctorAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const doctorId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId;
        if (!doctorId) {
            return res.status(400).json({
                status: false,
                message: "Doctor ID is required.",
                error: "Missing doctorId from request context.",
            });
        }
        const { search, status, sortBy, sortOrder, page = "1", limit = "10", startDate, endDate, } = req.query;
        let filters = {
            doctorId,
        };
        // Search logic
        if (search && typeof search === "string") {
            filters.OR = [
                { patient: { firstName: { contains: search, mode: "insensitive" } } },
                { patient: { lastName: { contains: search, mode: "insensitive" } } },
                { patient: { email: { contains: search, mode: "insensitive" } } },
                { patient: { phone: { contains: search, mode: "insensitive" } } },
            ];
        }
        // Status filter
        if (status &&
            typeof status === "string" &&
            status.toUpperCase() in client_1.AppointmentStatus) {
            filters.status = status.toUpperCase();
        }
        // Date range filter - Simplified
        if (startDate || endDate) {
            filters.appointmentTime = {};
            if (startDate) {
                filters.appointmentTime.gte = new Date(startDate); // Start date filter (greater than or equal)
            }
            if (endDate) {
                filters.appointmentTime.lte = new Date(endDate); // End date filter (less than or equal)
            }
        }
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;
        // Sorting
        const sortField = typeof sortBy === "string" ? sortBy : "appointmentTime";
        const sortDirection = sortOrder === "desc" || sortOrder === "asc" ? sortOrder : "asc";
        const [appointments, totalCount] = yield Promise.all([
            prismaConnection_1.prisma.appointment.findMany({
                where: filters,
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
                orderBy: {
                    [sortField]: sortDirection,
                },
                skip,
                take: pageSize,
            }),
            prismaConnection_1.prisma.appointment.count({ where: filters }),
        ]);
        return res.status(200).json({
            status: true,
            message: "Doctor appointments fetched successfully.",
            data: {
                total: totalCount,
                page: pageNumber,
                limit: pageSize,
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
        console.error("Error fetching doctor appointments:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while fetching the appointments.",
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
exports.getDoctorAppointments = getDoctorAppointments;
// Update Appointment Status
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const isGoogleCalendarConnected = (doctorUserId) => __awaiter(void 0, void 0, void 0, function* () {
        const doctor = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: doctorUserId },
            select: {
                googleRefreshToken: true,
            },
        });
        console.log("Google token check result:", doctor);
        return !!(doctor === null || doctor === void 0 ? void 0 : doctor.googleRefreshToken);
    });
    try {
        const doctorId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId;
        const { appointmentId, status } = req.body;
        if (!appointmentId || !status) {
            return res.status(400).json({
                status: false,
                message: "appointmentId and status are required.",
                data: {
                    error: "Missing fields in request body.",
                },
            });
        }
        const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Invalid status.",
                data: {
                    error: "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED",
                },
            });
        }
        const appointment = yield prismaConnection_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment || appointment.doctorId !== doctorId) {
            return res.status(403).json({
                status: false,
                message: "Not authorized to update this appointment.",
                data: {
                    error: "Unauthorized access.",
                },
            });
        }
        // ⛔️ Check Google Calendar connection BEFORE confirming
        if (status === "CONFIRMED") {
            const isConnected = yield isGoogleCalendarConnected(doctorId);
            if (!isConnected) {
                return res.status(400).json({
                    status: false,
                    message: "Please connect your Google Calendar to confirm appointments.",
                    data: {
                        error: "Google Calendar is not connected.",
                    },
                });
            }
        }
        // ✅ Update appointment status AFTER validations
        const updatedAppointment = yield prismaConnection_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });
        // Fetch full appointment details for email
        const fullDetails = yield prismaConnection_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
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
        if (fullDetails && fullDetails.patient && fullDetails.doctor) {
            const appointmentDetails = {
                patientName: `${fullDetails.patient.firstName} ${fullDetails.patient.lastName}`,
                patientEmail: fullDetails.patient.email,
                doctorName: `${fullDetails.doctor.user.firstName} ${fullDetails.doctor.user.lastName}`,
                doctorSpecialization: fullDetails.doctor.specialization,
                doctorEmail: fullDetails.doctor.user.email,
                consultationFee: fullDetails.doctor.consultationFee,
                appointmentTime: fullDetails.appointmentTime,
                status: fullDetails.status,
            };
            if (status === "CONFIRMED") {
                const startTime = new Date(fullDetails.appointmentTime);
                const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
                const meetLink = yield (0, googleMeet_1.createGoogleMeetEvent)(doctorId, startTime.toISOString(), endTime.toISOString(), fullDetails.doctor.user.email, fullDetails.patient.email);
                yield (0, emailConnection_1.sendAppointmentStatusUpdateEmail)(appointmentDetails.patientEmail, Object.assign(Object.assign({}, appointmentDetails), { meetLink: meetLink || "" }));
            }
            if (status === "CANCELLED") {
                yield (0, emailConnection_1.sendAppointmentStatusUpdateEmail)(appointmentDetails.patientEmail, Object.assign(Object.assign({}, appointmentDetails), { meetLink: "" }));
            }
        }
        return res.status(200).json({
            status: true,
            message: "Appointment status updated successfully.",
            data: {
                appointment: updatedAppointment,
            },
        });
    }
    catch (error) {
        console.error("Error updating appointment status:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while updating the appointment status.",
            data: {
                error: error instanceof Error ? error.message : "Internal server error",
            },
        });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
