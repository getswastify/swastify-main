"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserMessage = void 0;
// src/core/agent.ts
const core_1 = require("./core");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const tools_2 = require("../tools/tools");
const authToken = process.env.AUTH_TOKEN;
const searchDoctors = (0, tools_1.tool)(async (input) => {
    try {
        const params = {};
        if (input.search)
            params.search = input.search;
        if (input.specialty)
            params.specialty = input.specialty;
        const res = await axios_1.default.get(`${process.env.API_URL}/patient/get-doctors`, {
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
}, {
    name: "searchDoctors",
    description: "Search doctors by name and/or specialty.",
    schema: zod_1.z.object({
        search: zod_1.z.string().optional().describe("Doctor name to search for"),
        specialty: zod_1.z.string().optional().describe("Specialty to filter doctors"),
    }),
});
const getAvailableDatesForMonth = (0, tools_1.tool)(async (input) => {
    try {
        const { doctorId, year, month } = input;
        const res = await axios_1.default.get(`${process.env.API_URL}/patient/available-dates`, // put the actual endpoint URL here
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
}, {
    name: "getAvailableDatesForMonth",
    description: "Get available appointment dates for a doctor in a specific month and year.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        year: zod_1.z.number().int().describe("Year as a 4-digit number, e.g., 2025"),
        month: zod_1.z.number().int().min(1).max(12).describe("Month as a number between 1 and 12"),
    }),
});
const getCurrentDate = (0, tools_1.tool)(async () => {
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
}, {
    name: "getCurrentDate",
    description: "Get today's, tomorrow's, and day after tomorrow's date in DD/MM/YYYY format.",
    schema: zod_1.z.object({}),
});
const getAvailableTimeSlotsTool = (0, tools_1.tool)(async (input) => {
    const { doctorId, date } = input;
    const slots = await (0, tools_2.getAvailableTimeSlots)({ doctorId, date });
    if (slots.length === 0) {
        return `No available slots for doctor ${doctorId} on ${date} 😔`;
    }
    return `Available slots for ${date}:\n${slots.map((s) => s.displayTime).join(", ")}`;
}, {
    name: "getAvailableTimeSlots",
    description: "Get 30-minute available appointment time slots for a doctor on a specific date.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        date: zod_1.z.string().describe("The date in YYYY-MM-DD format"),
    }),
});
const threadId = "gundu-main-thread";
const globalMessages = [];
async function handleUserMessage(userInput) {
    // Push user message
    globalMessages.push({ role: 'user', content: userInput });
    const response = await core_1.agent.invoke({
        messages: globalMessages,
    }, {
        configurable: {
            thread_id: threadId,
        },
    });
    // Extract latest assistant message
    const assistantMsg = response.messages[response.messages.length - 1];
    const assistantContent = typeof assistantMsg.content === 'string'
        ? assistantMsg.content
        : Array.isArray(assistantMsg.content)
            ? assistantMsg.content.map((c) => { var _a; return (typeof c === 'string' ? c : (_a = c.text) !== null && _a !== void 0 ? _a : ''); }).join(' ')
            : '';
    // Push assistant reply
    globalMessages.push({
        role: 'assistant',
        content: assistantContent,
    });
    return assistantContent;
}
exports.handleUserMessage = handleUserMessage;
