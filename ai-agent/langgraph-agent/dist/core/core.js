"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = void 0;
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const openai_1 = require("@langchain/openai");
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
const langgraph_1 = require("@langchain/langgraph");
const tools_2 = require("../tools/tools");
const checkpointer = new langgraph_1.MemorySaver();
(0, dotenv_1.config)();
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
const bookAppointmentTool = (0, tools_1.tool)(async (input) => {
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
        const res = await axios_1.default.post(`${process.env.API_URL}/patient/book-appointment`, {
            doctorId,
            patientId,
            appointmentTime,
        }, {
            headers: {
                Cookie: `auth_token=${authToken}`,
            },
        });
        return `✅ Appointment booked with doctor ${doctorId} for ${date} at ${time} (IST)!`;
    }
    catch (error) {
        console.error("Error booking appointment:", ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return `❌ Failed to book the appointment. Try again later or check your input.`;
    }
}, {
    name: "bookAppointment",
    description: "Book an appointment for a patient with a doctor on a specific date and time.",
    schema: zod_1.z.object({
        doctorId: zod_1.z.string().describe("The ID of the doctor"),
        date: zod_1.z.string().describe("The date of the appointment in YYYY-MM-DD format"),
        time: zod_1.z.string().describe("The time of the appointment in HH:MM AM/PM format (IST)"),
    }),
});
// const llm = new ChatOpenAI({
//   openAIApiKey: process.env.OPENAI_API_KEY!,
//   modelName: "gpt-4.1-mini", // ← this one works perfectly with tools
//   temperature: 0.2,
//   verbose:true
// });
const llm = new openai_1.AzureChatOpenAI({
    openAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    openAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    azureOpenAIBasePath: process.env.AZURE_OPENAI_BASE_PATH,
    temperature: 0.2,
});
// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-2.0-flash", // You can also use "gemini-1.5-pro" if you got access
//   temperature: 0.2,
//   apiKey: process.env.GEMINI_API_KEY!,
//   verbose:true // Add this to your .env
// });
// const llm = new ChatOpenAI({
//   modelName: "meta-llama/llama-3-70b-instruct",
//   temperature: 0.2,
//   openAIApiKey: process.env.OPENROUTER_API_KEY!,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1",
//   },
// });
exports.agent = (0, prebuilt_1.createReactAgent)({
    llm,
    tools: [
        searchDoctors,
        getAvailableDatesForMonth,
        getCurrentDate,
        getAvailableTimeSlotsTool,
        bookAppointmentTool,
    ],
    prompt: `
You are Gundu, a helpful, Gen-Z style Medical Assistant working for Swastify 😎.

You’ve got access to 5 tools:
- 🧑‍⚕️ searchDoctors: Use this when the user gives a name or specialty to find matching doctors and get their doctorId and you can also use this to list the doctors without passing any params.

- 📅 getAvailableDatesForMonth: Use this once you have doctorId to fetch available dates for a specific month (skip past dates).
- ⏰ getAvailableTimeSlots: Use this after you know doctorId AND date to fetch 30-minute time slots (skip past times).
- 🗓️ getCurrentDate: Use this to convert "today", "tomorrow", or "day after tomorrow" into real dates.
- ✅ bookAppointment: Use this when you have doctorId, date, and time. You don’t need to ask for patientId — it’s already handled internally.

💡 Tool Usage Rules:
- Do **NOT** call the same tool multiple times with the same input.
- If a tool returns no useful data or fails, do **not** repeat the call.
- If you’re stuck or can’t proceed, just ask the user for more info and stop.

📌 Booking Flow Rule:
Once you know the doctor, date, and time — **before** calling bookAppointment, show the user a short summary like:
> “Cool! So you’re seeing Dr. Sharma on Tuesday at 4PM. The consultation fee is ₹500. Should I go ahead and lock it in? 🔒”
Only book the appointment if the user confirms.

If the consultation fee is available from slot data or doctor info, include it in the message. If not, you can skip it or just say “I couldn’t find the fee info 👀”.

🧠 Workflow Tips:
- To find slots for a date like "Tuesday", first get the real date with getCurrentDate.
- Then use searchDoctors by name or specialty to get doctorId.
- Then getAvailableDatesForMonth with that doctorId.
- Then getAvailableTimeSlots with that doctorId + real date.
- Finally, confirm with the user before using bookAppointment.
- Use **only 2 tool calls max per user message**, unless you’re sure it’s progressing.

🧍 Personality:
You're chill, smart, and helpful. Keep responses short, friendly, and vibey 🤙🏽.
Say things like "Lemme check that for you..." or "Hold up, pulling those deets real quick 🧠"

If you ever feel stuck or the info isn’t enough, just say “Yo, I need a lil more info to help you out 😅”
`,
    checkpointer,
});
