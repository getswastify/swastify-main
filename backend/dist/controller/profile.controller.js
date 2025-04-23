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
exports.createHospitalProfile = exports.createDoctorProfile = exports.createPatientProfile = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const profileSchema_1 = require("../zodSchemas/profileSchema");
const createPatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId || typeof userId !== "string") {
        return res.status(401).json({
            status: false,
            message: "User not authenticated",
        });
    }
    const validation = profileSchema_1.PatientProfileSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map(err => err.message).join(", "),
            error: {
                code: "VALIDATION_ERROR",
                issue: validation.error.errors.map(err => ({
                    path: err.path.join("."),
                    message: err.message,
                })),
            },
        });
    }
    const { bloodGroup, address, height, weight, allergies, diseases } = validation.data;
    try {
        const existingProfile = yield prismaConnection_1.prisma.patientProfile.findUnique({
            where: { userId },
        });
        if (existingProfile) {
            return res.status(409).json({
                status: false,
                message: "Patient profile already exists",
                error: {
                    code: "DUPLICATE_PROFILE",
                    issue: "A profile for this user already exists",
                },
            });
        }
        const newProfile = yield prismaConnection_1.prisma.patientProfile.create({
            data: {
                userId,
                bloodGroup,
                address,
                height,
                weight,
                allergies: allergies || [],
                diseases: diseases || [], // Store as array, default to empty if undefined
            },
        });
        return res.status(201).json({
            status: true,
            message: "Patient profile created successfully",
            data: newProfile,
        });
    }
    catch (error) {
        console.error("Error creating patient profile:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong while creating the patient profile.",
            error: {
                code: "SERVER_ERROR",
                issue: error instanceof Error ? error.message : "Unknown error",
            },
        });
    }
});
exports.createPatientProfile = createPatientProfile;
const createDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    const validation = profileSchema_1.DoctorProfileSchema.safeParse(req.body);
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
    const { specialization, clinicAddress, consultationFee, availableFrom, availableTo, } = validation.data;
    try {
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.create({
            data: {
                userId,
                specialization,
                clinicAddress,
                consultationFee,
                availableFrom,
                availableTo,
                status: 'PENDING',
            },
        });
        return res.status(201).json({
            status: true,
            message: 'Doctor profile created successfully',
            data: doctorProfile,
        });
    }
    catch (error) {
        console.error('Error creating doctor profile:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the doctor profile.',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.createDoctorProfile = createDoctorProfile;
const createHospitalProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    const validation = profileSchema_1.HospitalProfileSchema.safeParse(req.body);
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
    const { hospitalName, location, services } = validation.data;
    try {
        const hospitalProfile = yield prismaConnection_1.prisma.hospitalProfile.create({
            data: {
                userId,
                hospitalName,
                location,
                services,
                status: 'PENDING',
            },
        });
        return res.status(201).json({
            status: true,
            message: 'Hospital profile created successfully',
            data: hospitalProfile,
        });
    }
    catch (error) {
        console.error('Error creating hospital profile:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the hospital profile.',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.createHospitalProfile = createHospitalProfile;
