"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalProfileSchema = exports.DoctorProfileSchema = exports.PatientProfileSchema = void 0;
const zod_1 = require("zod");
exports.PatientProfileSchema = zod_1.z.object({
    bloodGroup: zod_1.z.enum([
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
    ], {
        required_error: "Please select your blood group",
    }),
    address: zod_1.z.string().min(5, "Address is too short"),
    height: zod_1.z
        .number({
        invalid_type_error: "Height must be a number",
    })
        .positive("Height must be a positive number"),
    weight: zod_1.z
        .number({
        invalid_type_error: "Weight must be a number",
    })
        .positive("Weight must be a positive number"),
    allergies: zod_1.z
        .array(zod_1.z.string().max(100, "Each allergy should be under 100 characters"))
        .optional(),
    diseases: zod_1.z
        .array(zod_1.z.string().max(100, "Each disease should be under 100 characters"))
        .optional(), // Same here, an empty array or one or more entries
});
exports.DoctorProfileSchema = zod_1.z.object({
    specialization: zod_1.z.string().min(3, "Specialization must be at least 3 characters"),
    clinicAddress: zod_1.z.string().min(5, "Clinic address is too short"),
    consultationFee: zod_1.z
        .number({
        invalid_type_error: "Consultation fee must be a number",
    })
        .positive("Consultation fee must be greater than 0"),
    availableFrom: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "availableFrom must be in HH:mm format",
    }),
    availableTo: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "availableTo must be in HH:mm format",
    }),
});
exports.HospitalProfileSchema = zod_1.z.object({
    hospitalName: zod_1.z.string().min(3, "Hospital name must be at least 3 characters"),
    location: zod_1.z.string().min(3, "Location must be at least 3 characters"),
    services: zod_1.z.string().min(5, "Please describe at least one service"),
});
