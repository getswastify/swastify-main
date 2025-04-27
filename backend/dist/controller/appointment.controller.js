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
exports.deleteAvailability = exports.updateDoctorAvailability = exports.setDoctorAvailability = exports.getDoctorAvailability = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const AppointmentSchema_1 = require("../zodSchemas/AppointmentSchema");
const getDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // The userId from the authenticated user
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated or invalid userId',
        });
    }
    try {
        // Step 1: Find the doctor's profile using the userId
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: userId }, // Match with the userId in the DoctorProfile table
        });
        if (!doctorProfile) {
            return res.status(404).json({
                status: false,
                message: 'Doctor profile not found for this user',
                error: {
                    code: 'DOCTOR_NOT_FOUND',
                    issue: `No doctor profile found for userId: ${userId}`,
                },
            });
        }
        const doctorId = doctorProfile.userId; // This is the doctorId
        // Step 2: Get the doctor's availability
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: {
                doctorId,
            },
            orderBy: {
                dayOfWeek: 'asc', // Ordering by day of the week to keep the days in the correct order (Sunday to Saturday)
            },
        });
        if (availability.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No availability set for this doctor',
                error: {
                    code: 'AVAILABILITY_NOT_FOUND',
                    issue: `No availability found for doctorId: ${doctorId}`,
                },
            });
        }
        return res.status(200).json({
            status: true,
            message: 'Doctor availability fetched successfully',
            data: availability,
        });
    }
    catch (error) {
        console.error('Error fetching doctor availability:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while fetching doctor availability.',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.getDoctorAvailability = getDoctorAvailability;
const setDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId; // The userId from the authenticated user
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated or invalid userId',
        });
    }
    const validation = AppointmentSchema_1.DoctorAvailabilitySchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map(err => err.message).join(', '),
            error: {
                code: 'VALIDATION_ERROR',
                issue: validation.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            },
        });
    }
    const { dayOfWeek, startTime, endTime } = validation.data;
    try {
        // Step 1: Find the doctor's profile using the userId
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: userId }, // Match with the userId in the DoctorProfile table
        });
        if (!doctorProfile) {
            return res.status(404).json({
                status: false,
                message: 'Doctor profile not found for this user',
                error: {
                    code: 'DOCTOR_NOT_FOUND',
                    issue: `No doctor profile found for userId: ${userId}`,
                },
            });
        }
        const doctorId = doctorProfile.userId; // This is the doctorId
        // Step 2: Check if the doctor already has availability set for this day
        const existingAvailability = yield prismaConnection_1.prisma.doctorAvailability.findFirst({
            where: { doctorId, dayOfWeek },
        });
        if (existingAvailability) {
            return res.status(409).json({
                status: false,
                message: `Doctor already has availability set for this day (${dayOfWeek})`,
                error: {
                    code: 'DUPLICATE_AVAILABILITY',
                    issue: 'Availability already set for this day of the week.',
                },
            });
        }
        // Step 3: Create the new doctor availability
        const newAvailability = yield prismaConnection_1.prisma.doctorAvailability.create({
            data: {
                doctorId,
                dayOfWeek,
                startTime,
                endTime,
            },
        });
        return res.status(201).json({
            status: true,
            message: 'Doctor availability set successfully',
            data: newAvailability,
        });
    }
    catch (error) {
        console.error('Error setting doctor availability:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while setting the doctor availability.',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.setDoctorAvailability = setDoctorAvailability;
const updateDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId; // The userId from the authenticated user
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated or invalid userId',
        });
    }
    const validation = AppointmentSchema_1.DoctorAvailabilitySchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map(err => err.message).join(', '),
            error: {
                code: 'VALIDATION_ERROR',
                issue: validation.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            },
        });
    }
    const { dayOfWeek, startTime, endTime } = validation.data;
    try {
        // Step 1: Find the doctor's profile using the userId
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: userId }, // Match with the userId in the DoctorProfile table
        });
        if (!doctorProfile) {
            return res.status(404).json({
                status: false,
                message: 'Doctor profile not found for this user',
                error: {
                    code: 'DOCTOR_NOT_FOUND',
                    issue: `No doctor profile found for userId: ${userId}`,
                },
            });
        }
        const doctorId = doctorProfile.userId; // This is the doctorId
        // Step 2: Find the existing availability by doctorId and dayOfWeek
        const existingAvailability = yield prismaConnection_1.prisma.doctorAvailability.findFirst({
            where: {
                doctorId,
                dayOfWeek,
            },
        });
        if (!existingAvailability) {
            return res.status(404).json({
                status: false,
                message: `No availability found for this day (${dayOfWeek})`,
                error: {
                    code: 'AVAILABILITY_NOT_FOUND',
                    issue: `No availability found for doctorId: ${doctorId} on day: ${dayOfWeek}`,
                },
            });
        }
        // Step 3: Update the existing availability
        const updatedAvailability = yield prismaConnection_1.prisma.doctorAvailability.update({
            where: {
                id: existingAvailability.id, // Match by the availability record ID
            },
            data: {
                startTime,
                endTime, // Update end time
            },
        });
        return res.status(200).json({
            status: true,
            message: 'Doctor availability updated successfully',
            data: updatedAvailability,
        });
    }
    catch (error) {
        console.error('Error updating doctor availability:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while updating the doctor availability.',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.updateDoctorAvailability = updateDoctorAvailability;
const deleteAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { availabilityId } = req.params;
    const doctorId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId; // Assuming you set req.user in auth middleware
    try {
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findUnique({
            where: { id: availabilityId },
        });
        if (!availability) {
            return res.status(404).json({
                status: false,
                message: "Availability not found",
                error: {
                    code: "NOT_FOUND",
                    issue: "The requested availability does not exist",
                },
            });
        }
        if (availability.doctorId !== doctorId) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this availability",
                error: {
                    code: "FORBIDDEN",
                    issue: "Doctor does not own this availability",
                },
            });
        }
        yield prismaConnection_1.prisma.doctorAvailability.delete({
            where: { id: availabilityId },
        });
        return res.status(200).json({
            status: true,
            message: "Availability deleted successfully",
            data: {},
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: {
                code: "SERVER_ERROR",
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.deleteAvailability = deleteAvailability;
