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
exports.bookAppointmentTool = exports.getAvailableTimeSlotsTool = exports.getCurrentDate = exports.getAvailableDatesForMonth = exports.searchDoctors = exports.getAvailableTimeSlots = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = require("dotenv");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const authToken = process.env.AUTH_TOKEN;
function getAvailableTimeSlots({ doctorId, date }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`${process.env.API_URL}/patient/available-slots`, {
                doctorId,
                date,
            });
            return response.data.availableSlots;
        }
        catch (err) {
            console.error("🛑 Slot API error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return [];
        }
    });
}
exports.getAvailableTimeSlots = getAvailableTimeSlots;
exports.searchDoctors = (0, tools_1.tool)((input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = {};
        if (input.search)
            params.search = input.search;
        if (input.specialty)
            params.specialty = input.specialty;
        const res = yield axios_1.default.get(`${process.env.API_URL}/patient/get-doctors`, {
            params,
            headers: {
                Cookie: `auth_token=${authToken}`,
            },
        });
        const data = res.data;
        if (!data.doctors || data.doctors.length === 0) {
            return "No doctors matched your search criteria.";
        }
        const doctorsList = data.doctors
            .map((doc, i) => `${i + 1}. Dr. ${doc.name} (ID: ${doc.userId}) - ${doc.specialty} (${doc.experience} years), Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`)
            .join("\n");
        return `Here are the doctors I found:\n\n${doctorsList}`;
    }
    catch (error) {
        console.error("Error searching doctors:", error);
        return "Sorry, I couldn't search doctors right now. Try again later.";
    }
}), {
    name: "searchDoctors",
    description: "Search doctors by name and/or specialty.",
    schema: zod_1.z.object({
        search: zod_1.z.string().optional().describe("Doctor name to search for"),
        specialty: zod_1.z.string().optional().describe("Specialty to filter doctors"),
    }),
});
exports.getAvailableDatesForMonth = (0, tools_1.tool)((input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, year, month } = input;
        const res = yield axios_1.default.get(`${process.env.API_URL}/patient/available-dates`, // put the actual endpoint URL here
        {
            params: { doctorId, year, month },
            headers: {
                Cookie: `auth_token=${authToken}`,
            },
        });
        const data = res.data;
        if (!data.availableDates || data.availableDates.length === 0) {
            return `No available dates found for doctor ${doctorId} in ${month}/${year}.`;
        }
        const datesList = data.availableDates.join(", ");
        return `Available dates for doctor ${doctorId} in ${month}/${year} are:\n${datesList}`;
    }
    catch (error) {
        console.error("Error fetching available dates:", error);
        return "Sorry, I couldn't fetch available dates right now. Try again later.";
    }
}), {
    name: "getAvailableDatesForMonth",
    description: "Get available appointment dates for a doctor in a specific month and year.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        year: zod_1.z.number().int().describe("Year as a 4-digit number, e.g., 2025"),
        month: zod_1.z.number().int().min(1).max(12).describe("Month as a number between 1 and 12"),
    }),
});
exports.getCurrentDate = (0, tools_1.tool)(() => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const format = (date) => date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    return `🗓️ Dates are as follows:
- Today: ${format(today)}
- Tomorrow: ${format(tomorrow)}
- Day after tomorrow: ${format(dayAfter)}`;
}), {
    name: "getCurrentDate",
    description: "Get today's, tomorrow's, and day after tomorrow's date in DD/MM/YYYY format.",
    schema: zod_1.z.object({}),
});
exports.getAvailableTimeSlotsTool = (0, tools_1.tool)((input) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId, date } = input;
    const slots = yield getAvailableTimeSlots({ doctorId, date });
    if (slots.length === 0) {
        return `No available slots for doctor ${doctorId} on ${date} `;
    }
    return `Available slots for ${date}:\n${slots.map((s) => s.displayTime).join(", ")}`;
}), {
    name: "getAvailableTimeSlots",
    description: "Get 30-minute available appointment time slots for a doctor on a specific date.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        date: zod_1.z.string().describe("The date in YYYY-MM-DD format"),
    }),
});
exports.bookAppointmentTool = (0, tools_1.tool)((input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { doctorId, date, time } = input;
        const patientId = process.env.PATIENT_ID;
        if (!patientId)
            throw new Error("Missing PATIENT_ID in environment variables");
        const toAppointmentTime = (date, time) => {
            const dateTimeString = `${date} ${time}`;
            const dateObj = new Date(dateTimeString); // local time
            return dateObj.toISOString(); // backend expects UTC ISO
        };
        const appointmentTime = toAppointmentTime(date, time);
        const res = yield axios_1.default.post(`${process.env.API_URL}/patient/book-appointment`, {
            doctorId,
            patientId,
            appointmentTime,
        }, {
            headers: {
                Cookie: `auth_token=${authToken}`,
            },
        });
        return ` Appointment booked with doctor ${doctorId} for ${date} at ${time} (IST)!`;
    }
    catch (error) {
        console.error("Error booking appointment:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return `❌ Failed to book the appointment. Try again later or check your input.`;
    }
}), {
    name: "bookAppointment",
    description: "Book an appointment for a patient with a doctor on a specific date and time.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        date: zod_1.z.string().describe("The date of the appointment in YYYY-MM-DD format"),
        time: zod_1.z.string().describe("The time of the appointment in HH:MM AM/PM format (IST)"),
    }),
});
