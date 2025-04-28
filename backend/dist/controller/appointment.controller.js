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
exports.getPublicDoctorAvailability = exports.getApprovedDoctors = void 0;
const CalculateExperience_1 = require("../helper/CalculateExperience");
const prismaConnection_1 = require("../utils/prismaConnection");
const getApprovedDoctors = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const approvedDoctors = yield prismaConnection_1.prisma.doctorProfile.findMany({
            where: {
                status: 'APPROVED',
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    },
                },
            },
        });
        return res.status(200).json({
            status: true,
            message: 'Approved doctors fetched successfully',
            data: approvedDoctors.map((doctor) => ({
                doctorId: doctor.userId,
                fullName: {
                    firstName: doctor.user.firstName,
                    lastName: doctor.user.lastName
                },
                specialization: doctor.specialization,
                experience: (0, CalculateExperience_1.calculateExperience)(doctor.startedPracticeOn.toISOString()),
                consultationFee: doctor.consultationFee,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching doctors:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while fetching doctors.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getApprovedDoctors = getApprovedDoctors;
const getPublicDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId } = req.params; // Get doctorId from the URL params
    try {
        // Step 1: Fetch the doctor's profile and availability details
        const doctorAvailability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: {
                doctorId: doctorId, // Filter by doctorId
            },
            include: {
                timeSlots: true, // Include the time slots for the doctor
            },
        });
        if (doctorAvailability.length === 0) {
            return res.status(404).json({
                status: false,
                message: `No availability found for doctorId: ${doctorId}`,
                error: {
                    code: 'NO_AVAILABILITY',
                    issue: `This doctor doesn't have any available time slots set.`,
                },
            });
        }
        // Step 2: Format response to include the doctor details + available time slots
        const availabilityResponse = doctorAvailability.map((availability) => ({
            dayOfWeek: availability.dayOfWeek,
            timeSlots: availability.timeSlots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
            })),
        }));
        return res.status(200).json({
            status: true,
            message: 'Doctor availability fetched successfully',
            data: availabilityResponse,
        });
    }
    catch (error) {
        console.error('Error fetching doctor availability:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while fetching doctor availability.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.getPublicDoctorAvailability = getPublicDoctorAvailability;
