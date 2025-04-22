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
exports.createHospitalProfile = exports.createDoctorProfile = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const createDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.user);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    try {
        // Create a new doctor profile and link it to the userId
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.create({
            data: {
                userId: userId,
                specialization: req.body.specialization,
                clinicAddress: req.body.clinicAddress,
                consultationFee: req.body.consultationFee,
                status: 'PENDING',
                availableFrom: req.body.availableFrom,
                availableTo: req.body.availableTo, // Get availableTo time from the request body
            },
        });
        // Send success response with the created doctor profile data
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
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
            status: false,
            message: 'User not authenticated',
        });
    }
    try {
        // Create new hospital profile and link it to the userId
        const hospitalProfile = yield prismaConnection_1.prisma.hospitalProfile.create({
            data: {
                userId: userId,
                hospitalName: req.body.hospitalName,
                location: req.body.location,
                services: req.body.services,
                status: 'PENDING', // Default status
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
