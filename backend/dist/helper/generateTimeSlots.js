"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimeSlots = void 0;
const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    let currentStart = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    while (currentStart < end) {
        const currentEnd = new Date(currentStart.getTime() + duration * 60000); // Add duration in ms
        const slotStart = currentStart.toISOString().substring(11, 16); // Format time to hh:mm
        const slotEnd = currentEnd.toISOString().substring(11, 16); // Format time to hh:mm
        slots.push({ startTime: slotStart, endTime: slotEnd });
        currentStart = currentEnd; // Move to the next time slot
    }
    return slots;
};
exports.generateTimeSlots = generateTimeSlots;
