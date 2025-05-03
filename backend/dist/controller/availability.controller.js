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
exports.deleteDoctorAvailability = exports.updateDoctorAvailability = exports.setDoctorAvailability = exports.getDoctorAvailability = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const formatSuccess = (message, data = null) => ({
    status: true,
    message,
    data,
});
const formatError = (message, error = null) => ({
    status: false,
    message,
    error,
});
// Consistent function to build date-time with IST offset
const buildDateTimeFromTimeString = (dayOfWeek, timeStr) => {
    const now = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayIndex = now.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
    if (targetDayIndex === -1)
        throw new Error("Invalid dayOfWeek");
    const diff = (targetDayIndex - currentDayIndex + 7) % 7;
    // Construct a date string in IST (India is always UTC+5:30, no DST)
    const [hours, minutes] = timeStr.split(":");
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    // Store as UTC time but with the correct offset from IST
    // This means we subtract 5:30 from the IST time to get the equivalent UTC time
    const utcHours = Number.parseInt(hours) - 5;
    const utcMinutes = Number.parseInt(minutes) - 30;
    // Handle minute underflow
    let adjustedHours = utcHours;
    let adjustedMinutes = utcMinutes;
    if (adjustedMinutes < 0) {
        adjustedMinutes += 60;
        adjustedHours -= 1;
    }
    // Handle hour underflow (might go to previous day)
    if (adjustedHours < 0) {
        adjustedHours += 24;
        // Adjust the day if needed (subtract 1 day)
        targetDate.setDate(targetDate.getDate() - 1);
    }
    const utcDateStr = `${year}-${month}-${day}T${String(adjustedHours).padStart(2, "0")}:${String(adjustedMinutes).padStart(2, "0")}:00Z`;
    return new Date(utcDateStr);
};
const getDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!doctorId) {
            return res.status(400).json(formatError("Doctor ID is required."));
        }
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: { doctorId },
            orderBy: { startTime: "asc" },
        });
        if (availability.length === 0) {
            return res.status(404).json(formatError("No availability found for the doctor."));
        }
        return res.status(200).json(formatSuccess("Availability fetched successfully.", availability));
    }
    catch (error) {
        console.error("Error fetching doctor availability:", error);
        return res.status(500).json(formatError("Something went wrong while fetching availability.", error));
    }
});
exports.getDoctorAvailability = getDoctorAvailability;
const setDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const doctorId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
        if (!doctorId) {
            return res.status(400).json(formatError("Doctor ID is required."));
        }
        const { dayOfWeek, timeSlots } = req.body;
        if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            return res.status(400).json(formatError("Invalid input. Please provide dayOfWeek and timeSlots."));
        }
        // Check for overlapping slots
        const isOverlapping = (startA, endA, startB, endB) => {
            return startA < endB && startB < endA;
        };
        const availabilityData = timeSlots.map((slot) => ({
            doctorId,
            dayOfWeek,
            startTime: buildDateTimeFromTimeString(dayOfWeek, slot.startTime),
            endTime: buildDateTimeFromTimeString(dayOfWeek, slot.endTime),
        }));
        // Check for conflicts between provided time slots
        for (let i = 0; i < availabilityData.length; i++) {
            for (let j = i + 1; j < availabilityData.length; j++) {
                if (isOverlapping(availabilityData[i].startTime, availabilityData[i].endTime, availabilityData[j].startTime, availabilityData[j].endTime)) {
                    return res.status(400).json(formatError("Conflict between provided time slots."));
                }
            }
        }
        // Check for existing availability on the same day
        const existingAvailability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: { doctorId, dayOfWeek },
        });
        if (existingAvailability.length > 0) {
            return res.status(400).json(formatError("Availability for this day already exists."));
        }
        // Create new availability
        yield prismaConnection_1.prisma.doctorAvailability.createMany({ data: availabilityData });
        return res.status(201).json(formatSuccess("Availability set successfully."));
    }
    catch (error) {
        console.error("Error setting doctor availability:", error);
        return res.status(500).json(formatError("Something went wrong while setting availability.", error));
    }
});
exports.setDoctorAvailability = setDoctorAvailability;
const updateDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const doctorId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
        if (!doctorId) {
            return res.status(400).json(formatError("Doctor ID is required."));
        }
        const { dayOfWeek, timeSlots } = req.body;
        if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            return res.status(400).json(formatError("Invalid input. Please provide dayOfWeek and timeSlots."));
        }
        const existingAvailability = yield prismaConnection_1.prisma.doctorAvailability.findMany({
            where: { doctorId, dayOfWeek },
        });
        if (existingAvailability.length === 0) {
            return res.status(400).json(formatError("First create availability for this day before updating it."));
        }
        const isOverlapping = (startA, endA, startB, endB) => {
            return startA < endB && startB < endA;
        };
        const availabilityData = timeSlots.map((slot) => ({
            doctorId,
            dayOfWeek,
            startTime: buildDateTimeFromTimeString(dayOfWeek, slot.startTime),
            endTime: buildDateTimeFromTimeString(dayOfWeek, slot.endTime),
        }));
        for (let i = 0; i < availabilityData.length; i++) {
            for (let j = i + 1; j < availabilityData.length; j++) {
                if (isOverlapping(availabilityData[i].startTime, availabilityData[i].endTime, availabilityData[j].startTime, availabilityData[j].endTime)) {
                    return res.status(400).json(formatError("Conflict between provided time slots."));
                }
            }
        }
        yield prismaConnection_1.prisma.doctorAvailability.deleteMany({
            where: { doctorId, dayOfWeek },
        });
        yield prismaConnection_1.prisma.doctorAvailability.createMany({ data: availabilityData });
        return res.status(200).json(formatSuccess("Availability updated successfully."));
    }
    catch (error) {
        console.error("Error updating doctor availability:", error);
        return res.status(500).json(formatError("Something went wrong while updating availability.", error));
    }
});
exports.updateDoctorAvailability = updateDoctorAvailability;
const deleteDoctorAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const doctorId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.userId;
        if (!doctorId) {
            return res.status(400).json(formatError("Doctor ID is required."));
        }
        const { availabilityId } = req.body;
        if (!availabilityId) {
            return res.status(400).json(formatError("Availability ID is required."));
        }
        const availability = yield prismaConnection_1.prisma.doctorAvailability.findUnique({
            where: { id: availabilityId },
        });
        if (!availability) {
            return res.status(404).json(formatError("Availability slot not found."));
        }
        if (availability.doctorId !== doctorId) {
            return res.status(403).json(formatError("You are not authorized to delete this availability."));
        }
        yield prismaConnection_1.prisma.doctorAvailability.delete({
            where: { id: availabilityId },
        });
        return res.status(200).json(formatSuccess("Availability slot deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting doctor availability:", error);
        return res.status(500).json(formatError("Something went wrong while deleting availability.", error));
    }
});
exports.deleteDoctorAvailability = deleteDoctorAvailability;
