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
exports.registerHospital = exports.registerDoctor = exports.registerPatient = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../generated/prisma");
const client_1 = require("../prismaClient/client");
const hashPassword = (password) => bcryptjs_1.default.hash(password, 10);
const registerPatient = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, password, firstName, lastName, dob, gender, } = body;
        const hashedPassword = yield hashPassword(password);
        const user = yield client_1.prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob: new Date(dob),
                gender,
                role: prisma_1.UserRole.USER,
                patientProfile: {
                    create: {},
                },
            },
        });
        return { status: 201, data: { user } };
    }
    catch (err) {
        return { status: 500, data: { error: 'Something went wrong' } };
    }
});
exports.registerPatient = registerPatient;
const registerDoctor = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, password, firstName, lastName, dob, gender, specialization, clinicAddress, availableFrom, availableTo, consultationFee, } = body;
        const hashedPassword = yield hashPassword(password);
        const user = yield client_1.prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob: new Date(dob),
                gender,
                role: prisma_1.UserRole.DOCTOR,
                doctorProfile: {
                    create: {
                        specialization,
                        clinicAddress,
                        availableFrom: new Date(availableFrom),
                        availableTo: new Date(availableTo),
                        consultationFee: parseFloat(consultationFee),
                        status: prisma_1.ApprovalStatus.PENDING,
                    },
                },
            },
        });
        return { status: 201, data: { user } };
    }
    catch (err) {
        return { status: 500, data: { error: 'Something went wrong' } };
    }
});
exports.registerDoctor = registerDoctor;
const registerHospital = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, password, firstName, lastName, dob, gender, hospitalName, location, services, } = body;
        const hashedPassword = yield hashPassword(password);
        const user = yield client_1.prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob: new Date(dob),
                gender,
                role: prisma_1.UserRole.HOSPITAL,
                hospitalProfile: {
                    create: {
                        hospitalName,
                        location,
                        services,
                        status: prisma_1.ApprovalStatus.PENDING,
                    },
                },
            },
        });
        return { status: 201, data: { user } };
    }
    catch (err) {
        return { status: 500, data: { error: 'Something went wrong' } };
    }
});
exports.registerHospital = registerHospital;
