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
exports.getHospitalDashboard = exports.getDoctorDashboard = exports.getPatientDashboard = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const getPatientDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Get the patient's profile
        const profile = yield prismaConnection_1.prisma.patientProfile.findUnique({
            where: { userId },
            select: {
                bloodGroup: true,
                address: true,
                height: true,
                weight: true,
            },
        });
        const isProfileComplete = !!(profile === null || profile === void 0 ? void 0 : profile.bloodGroup) && !!(profile === null || profile === void 0 ? void 0 : profile.address) && !!(profile === null || profile === void 0 ? void 0 : profile.height) && !!(profile === null || profile === void 0 ? void 0 : profile.weight);
        return res.status(200).json({
            status: true,
            message: 'Patient dashboard data retrieved successfully',
            data: {
                isProfileComplete,
                // You can add more dashboard-related data here later
            },
        });
    }
    catch (error) {
        console.error('[GET_PATIENT_DASHBOARD_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch patient dashboard data',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong while getting dashboard info',
            },
        });
    }
});
exports.getPatientDashboard = getPatientDashboard;
const getDoctorDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        const profile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId },
            select: {
                specialization: true,
                clinicAddress: true,
                consultationFee: true,
                status: true, // Add the status field to check verification status
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
        const isProfileComplete = !!profile.specialization && !!profile.clinicAddress && !!profile.consultationFee;
        const isVerified = profile.status || null; // Set isVerified based on the profile's status field
        return res.status(200).json({
            status: true,
            message: 'Doctor dashboard data retrieved successfully',
            data: {
                isProfileComplete,
                isVerified, // Include isVerified in the response
            },
        });
    }
    catch (error) {
        console.error('[GET_DOCTOR_DASHBOARD_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch doctor dashboard data',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong while getting dashboard info',
            },
        });
    }
});
exports.getDoctorDashboard = getDoctorDashboard;
const getHospitalDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
        const profile = yield prismaConnection_1.prisma.hospitalProfile.findUnique({
            where: { userId },
            select: {
                hospitalName: true,
                location: true,
                services: true,
                status: true, // Add the status field here to determine isVerified
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
        const isProfileComplete = !!profile.hospitalName && !!profile.location && !!profile.services;
        const isVerified = profile.status || null; // Set isVerified based on the profile's status field
        return res.status(200).json({
            status: true,
            message: 'Hospital dashboard data retrieved successfully',
            data: {
                isProfileComplete,
                isVerified, // Include isVerified in the response
            },
        });
    }
    catch (error) {
        console.error('[GET_HOSPITAL_DASHBOARD_ERROR]', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch hospital dashboard data',
            error: {
                code: 'SERVER_ERROR',
                issue: 'Something went wrong while getting dashboard info',
            },
        });
    }
});
exports.getHospitalDashboard = getHospitalDashboard;
