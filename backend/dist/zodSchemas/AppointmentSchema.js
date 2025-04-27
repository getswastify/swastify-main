"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorAvailabilitySchema = exports.TimeSlotSchema = void 0;
const zod_1 = require("zod");
exports.TimeSlotSchema = zod_1.z.object({
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
});
exports.DoctorAvailabilitySchema = zod_1.z.object({
    dayOfWeek: zod_1.z.number(),
    timeSlots: zod_1.z.array(exports.TimeSlotSchema), // This expects an array of time slot objects
});
