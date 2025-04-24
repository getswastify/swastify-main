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
exports.getHospitalProfile = exports.getDoctorProfile = exports.getPatientProfile = exports.updateHospitalProfile = exports.updateDoctorProfile = exports.updatePatientProfile = exports.createHospitalProfile = exports.createDoctorProfile = exports.createPatientProfile = void 0;
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
const updatePatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    const validation = profileSchema_1.UpdatePatientProfileSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map(e => e.message).join(', '),
            error: {
                code: 'VALIDATION_ERROR',
                issue: validation.error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }
    const { bloodGroup, address, height, weight, allergies, diseases } = validation.data;
    try {
        const updatedProfile = yield prismaConnection_1.prisma.patientProfile.update({
            where: { userId },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (bloodGroup && { bloodGroup })), (address && { address })), (height && { height })), (weight && { weight })), (allergies && { allergies })), (diseases && { diseases })),
        });
        return res.status(200).json({
            status: true,
            message: 'Patient profile updated successfully',
            data: updatedProfile,
        });
    }
    catch (error) {
        console.error('Error updating patient profile:', error);
        if (error instanceof Error && error.code === 'P2025') {
            return res.status(404).json({
                status: false,
                message: 'Patient profile not found',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Failed to update patient profile',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.updatePatientProfile = updatePatientProfile;
const updateDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    const validation = profileSchema_1.UpdateDoctorProfileSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map((err) => err.message).join(', '),
            error: {
                code: 'VALIDATION_ERROR',
                issue: validation.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            },
        });
    }
    const { specialization, clinicAddress, consultationFee, availableFrom, availableTo } = validation.data;
    try {
        const updatedDoctorProfile = yield prismaConnection_1.prisma.doctorProfile.update({
            where: { userId },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (specialization && { specialization })), (clinicAddress && { clinicAddress })), (consultationFee && { consultationFee })), (availableFrom && { availableFrom })), (availableTo && { availableTo })),
        });
        return res.status(200).json({
            status: true,
            message: 'Doctor profile updated successfully',
            data: updatedDoctorProfile,
        });
    }
    catch (error) {
        console.error('Error updating doctor profile:', error);
        if (error instanceof Error && error.code === 'P2025') {
            return res.status(404).json({
                status: false,
                message: 'Doctor profile not found',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Failed to update doctor profile',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.updateDoctorProfile = updateDoctorProfile;
const updateHospitalProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    const validation = profileSchema_1.UpdateHospitalProfileSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            status: false,
            message: validation.error.errors.map((err) => err.message).join(', '),
            error: {
                code: 'VALIDATION_ERROR',
                issue: validation.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            },
        });
    }
    const { hospitalName, location, services } = validation.data;
    try {
        const updatedHospitalProfile = yield prismaConnection_1.prisma.hospitalProfile.update({
            where: { userId },
            data: Object.assign(Object.assign(Object.assign({}, (hospitalName && { hospitalName })), (location && { location })), (services && { services })),
        });
        return res.status(200).json({
            status: true,
            message: 'Hospital profile updated successfully',
            data: updatedHospitalProfile,
        });
    }
    catch (error) {
        console.error('Error updating hospital profile:', error);
        if (error instanceof Error && error.code === 'P2025') {
            return res.status(404).json({
                status: false,
                message: 'Hospital profile not found',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Failed to update hospital profile',
            error: {
                code: 'SERVER_ERROR',
                issue: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
});
exports.updateHospitalProfile = updateHospitalProfile;
const getPatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g.userId;
        const profile = yield prismaConnection_1.prisma.patientProfile.findUnique({
            where: { userId },
            select: {
                userId: true,
                bloodGroup: true,
                address: true,
                height: true,
                weight: true,
            },
        });
        if (!profile) {
            return res.status(404).json({
                status: false,
                message: 'Patient profile not found',
                data: {
                    code: 'PROFILE_NOT_FOUND',
                    issue: 'No patient profile exists for this user',
                    isProfileComplete: false
                },
            });
        }
        const isProfileComplete = !!profile.bloodGroup && !!profile.address && !!profile.height && !!profile.weight;
        return res.status(200).json({
            status: true,
            message: 'Patient profile retrieved successfully',
            data: Object.assign(Object.assign({}, profile), { isProfileComplete }),
        });
    }
    catch (error) {
        console.error('[GET_PATIENT_PROFILE_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to retrieve patient profile',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong on the server',
            },
        });
    }
});
exports.getPatientProfile = getPatientProfile;
const getDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const userId = (_h = req.user) === null || _h === void 0 ? void 0 : _h.userId;
        const profile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId },
            select: {
                userId: true,
                specialization: true,
                clinicAddress: true,
                consultationFee: true
            },
        });
        if (!profile) {
            return res.status(404).json({
                status: false,
                message: 'Doctor profile not found',
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    issue: 'No doctor profile exists for this user',
                },
            });
        }
        const isProfileComplete = !!profile.specialization &&
            !!profile.clinicAddress &&
            !!profile.consultationFee;
        return res.status(200).json({
            status: true,
            message: 'Doctor profile retrieved successfully',
            data: Object.assign(Object.assign({}, profile), { isProfileComplete }),
        });
    }
    catch (error) {
        console.error('[GET_DOCTOR_PROFILE_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to retrieve doctor profile',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong on the server',
            },
        });
    }
});
exports.getDoctorProfile = getDoctorProfile;
const getHospitalProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j.userId;
        const profile = yield prismaConnection_1.prisma.hospitalProfile.findUnique({
            where: { userId },
            select: {
                userId: true,
                hospitalName: true,
                location: true,
                services: true,
                status: true
            },
        });
        if (!profile) {
            return res.status(404).json({
                status: false,
                message: 'Hospital profile not found',
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    issue: 'No hospital profile exists for this user',
                },
            });
        }
        const isProfileComplete = !!profile.hospitalName &&
            !!profile.location &&
            !!profile.services;
        return res.status(200).json({
            status: true,
            message: 'Hospital profile retrieved successfully',
            data: Object.assign(Object.assign({}, profile), { isProfileComplete }),
        });
    }
    catch (error) {
        console.error('[GET_HOSPITAL_PROFILE_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to retrieve hospital profile',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong on the server',
            },
        });
    }
});
exports.getHospitalProfile = getHospitalProfile;
