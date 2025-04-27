"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorAvailabilitySchema = void 0;
const zod_1 = require("zod");
exports.DoctorAvailabilitySchema = zod_1.z.object({
    dayOfWeek: zod_1.z
        .number()
        .int()
        .min(0, { message: 'Day of week must be an integer between 0 and 6.' })
        .max(6, { message: 'Day of week must be an integer between 0 and 6.' }),
    startTime: zod_1.z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/, {
        message: 'Start time must be in 24-hour HH:mm format (e.g., 09:00, 14:30).',
    }),
    endTime: zod_1.z
        .string()
        .regex(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/, {
        message: 'End time must be in 24-hour HH:mm format (e.g., 09:00, 14:30).',
    }),
});
