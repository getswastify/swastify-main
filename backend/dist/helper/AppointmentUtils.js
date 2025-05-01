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
exports.checkForConflicts = exports.generateSlotsForAvailability = exports.getDoctorAvailabilityForDay = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const SLOT_DURATION_MINUTES = 30; // Duration of each appointment slot in minutes
// Function to get doctor's availability for a specific day
const getDoctorAvailabilityForDay = (doctorId, dayOfWeek) => __awaiter(void 0, void 0, void 0, function* () {
    const availability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
        where: {
            doctorId,
            dayOfWeek,
        },
        orderBy: {
            startTime: 'asc', // Sort by start time
        },
    });
    if (availability.length === 0) {
        throw new Error('No availability found for this day.');
    }
    return availability;
});
exports.getDoctorAvailabilityForDay = getDoctorAvailabilityForDay;
// Function to generate slots based on the doctor's availability
const generateSlotsForAvailability = (availability) => {
    const slots = [];
    availability.forEach((avail) => {
        let start = new Date(avail.startTime);
        const end = new Date(avail.endTime);
        while (start < end) {
            const slotEnd = new Date(start);
            slotEnd.setMinutes(start.getMinutes() + SLOT_DURATION_MINUTES);
            // Only add slot if the end time is within the doctor's availability
            if (slotEnd <= end) {
                slots.push({
                    startTime: start,
                    endTime: slotEnd,
                });
            }
            start = slotEnd; // Move to the next slot
        }
    });
    return slots;
};
exports.generateSlotsForAvailability = generateSlotsForAvailability;
// Function to check for conflicts with existing appointments
const checkForConflicts = (doctorId, newSlot) => __awaiter(void 0, void 0, void 0, function* () {
    const existingAppointments = yield prismaConnection_1.prisma.appointment.findMany({
        where: {
            doctorId,
            appointmentTime: {
                gte: newSlot.startTime,
                lt: newSlot.endTime, // Check if the new appointment ends before the existing one
            },
        },
    });
    if (existingAppointments.length > 0) {
        return true; // Conflict exists
    }
    return false; // No conflict
});
exports.checkForConflicts = checkForConflicts;
