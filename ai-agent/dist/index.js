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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3-8b-instruct";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
function askLlama(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.post(API_URL, {
                model: MODEL,
                messages,
            }, {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost",
                    "X-Title": "SwastifyAgent",
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (err) {
            console.error("❌ Error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return "Oops, something went wrong.";
        }
    });
}
function getDoctorsFromSwastify(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const query = new URLSearchParams(params).toString();
            const response = yield axios_1.default.get(`https://api.swastify.life/patient/get-doctors?${query}`, {
                headers: {
                    Cookie: `auth_token=${AUTH_TOKEN}`,
                },
            });
            const doctors = response.data.doctors;
            if (!doctors.length)
                return "No doctors found, Bhau 😔";
            return doctors
                .map((doc, i) => {
                return `${i + 1}. ${doc.name} — ${doc.specialty}, ${doc.experience} yrs exp, Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`;
            })
                .join("\n");
        }
        catch (err) {
            console.error("❌ Doctor fetch failed:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return "Unable to fetch doctors right now.";
        }
    });
}
function getAvailableDates(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            // Proper fallback for year and month
            const now = new Date();
            const year = (_a = params.year) !== null && _a !== void 0 ? _a : now.getFullYear();
            const month = (_b = params.month) !== null && _b !== void 0 ? _b : now.getMonth() + 1; // month is 1-based for API
            // Validate doctorId presence
            if (!params.doctorId) {
                return "Doctor ID missing for fetching available dates.";
            }
            const query = new URLSearchParams({
                doctorId: params.doctorId,
                year: year.toString(),
                month: month.toString(),
            }).toString();
            const response = yield axios_1.default.get(`https://api.swastify.life/patient/available-dates?${query}`, {
                headers: {
                    Cookie: `auth_token=${AUTH_TOKEN}`,
                },
            });
            const availableDates = response.data.availableDates;
            if (!availableDates || availableDates.length === 0) {
                return `No available dates found for the doctor in ${month}/${year}, Bhau 😔`;
            }
            return `Available dates for the doctor in ${month}/${year} are:\n${availableDates.join(", ")}`;
        }
        catch (err) {
            console.error("❌ Fetching available dates failed:", ((_c = err.response) === null || _c === void 0 ? void 0 : _c.data) || err.message);
            return "Unable to fetch available dates right now.";
        }
    });
}
function getAvailableSlots(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            if (!params.doctorId || !params.date) {
                return "doctorId or date missing for fetching available slots.";
            }
            const response = yield axios_1.default.post("https://api.swastify.life/patient/available-slots", {
                doctorId: params.doctorId,
                date: params.date,
            }, {
                headers: {
                    Cookie: `auth_token=${AUTH_TOKEN}`,
                },
            });
            const availableSlots = response.data.availableSlots;
            if (!availableSlots || availableSlots.length === 0) {
                return `No available appointment slots found for the doctor on ${params.date}, Bhau 😔`;
            }
            return (`Available appointment slots on ${params.date} are:\n` +
                availableSlots.map((slot, i) => `${i + 1}. ${slot.displayTime}`).join("\n"));
        }
        catch (err) {
            console.error("❌ Fetching available slots failed:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return "Unable to fetch available appointment slots right now.";
        }
    });
}
function bookAppointment(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const response = yield axios_1.default.post("https://api.swastify.life/patient/book-appointment", {
                patientId: params.patientId,
                doctorId: params.doctorId,
                appointmentTime: params.appointmentTime,
            }, {
                headers: {
                    Cookie: `auth_token=${AUTH_TOKEN}`,
                },
            });
            return `✅ Appointment booked successfully for ${new Date(params.appointmentTime).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: true,
                dateStyle: "medium",
                timeStyle: "short",
            })}! The doctor will be notified.`;
        }
        catch (err) {
            console.error("❌ Booking appointment failed:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            if ((_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) {
                return `Booking failed: ${err.response.data.error}`;
            }
            return "Something went wrong while booking your appointment. Try again later.";
        }
    });
}
// Parse tool calls from LLM replies with strict JSON parsing
function parseToolCall(content) {
    const regex = /\[\[CALL_TOOL:\s*(getDoctors|getAvailableDates|getAvailableSlots|bookAppointment)\s*(\{[\s\S]*?\})\s*\]\]/;
    const match = content.match(regex);
    if (!match)
        return null;
    try {
        const tool = match[1];
        const params = JSON.parse(match[2]);
        return { tool, params };
    }
    catch (err) {
        console.error("❌ Failed to parse tool params:", err);
        return null;
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🧠 Swastify AI Agent ready! Type 'exit' to stop.");
        const messages = [
            {
                role: "system",
                content: `
You are Gundu Bhaai — a chill, respectful AI assistant for Swastify healthcare.

✅ Tools you can use (ONLY these):

1. getDoctors({ "search"?: string, "specialty"?: string }) → Find doctors by name or specialty.
2. getAvailableDates({ "doctorId": string, "year"?: number, "month"?: number }) → Get doctor's free dates.
3. getAvailableSlots({ "doctorId": string, "date": string }) → Get appointment time slots for a doctor on a date.
4. bookAppointment({ "patientId": string, "doctorId": string, "appointmentTime": string }) → Book an appointment.

🚀 Appointment Booking Workflow (Follow this order, bro):

1. First, find the doc using getDoctors by name or specialty.
2. Extract the doctorId and full name from the results.
3. Then check if doc is free by calling getAvailableDates with that doctorId plus the year and month user wants.
4. Show the user available dates and ask them to pick one.
5. Next, get available time slots for the chosen date using getAvailableSlots with doctorId and date.
6. Show time slots to user and ask them to pick a slot.
7. Before booking, confirm ALL details with user:
   - Doctor full name
   - Appointment date (YYYY-MM-DD)
   - Time slot (IST, 24-hour format)
   - Patient info (patientId is assumed known)
8. Ask for user confirmation (yes/no).
9. ONLY after user says yes, call bookAppointment with patientId, doctorId, and appointmentTime.
10. If no, cancel booking and offer to help again.

🚨 IMPORTANT:
- NEVER hallucinate results, always call tools to get info.
- NEVER book without explicit user confirmation.
- ALWAYS respond like a desi GenZ bro — chill, clear, respectful.

HOW TO CALL TOOLS:
Reply with [[CALL_TOOL: toolName { JSON_OBJECT }]] exactly, where:

- JSON_OBJECT is strict JSON:
  - All keys and string values DOUBLE-quoted.
  - No placeholders like <DOCTOR ID> — use actual values or ask user.
  - No question marks or optional keys in output; always include keys.
  - Dates in ISO format, e.g., "2025-05-17".
  - Numeric values as numbers, no quotes.

Example:
User: “Find a skin specialist named Raj”  
Gundu Bhaai: [[CALL_TOOL: getDoctors { "search": "Raj", "specialty": "skin" }]]

      `.trim(),
            },
        ];
        let lastDoctorList = "";
        let lastDoctorId = "";
        let lastDoctorName = "";
        let lastAvailableDates = "";
        let lastSelectedDate = "";
        let lastAvailableSlots = "";
        // Patient ID can be static or ask user for more flexibility
        const patientId = "b46f45d6-cc80-4fb9-a070-f189ebf01a62";
        while (true) {
            const input = readline_sync_1.default.question("\n👤 You: ");
            if (input.toLowerCase() === "exit")
                break;
            messages.push({ role: "user", content: input });
            const llamaReply = yield askLlama(messages);
            const toolCall = parseToolCall(llamaReply);
            if (toolCall) {
                switch (toolCall.tool) {
                    case "getDoctors":
                        console.log("🛠️ Tool Triggered: getDoctors");
                        const doctorsResult = yield getDoctorsFromSwastify(toolCall.params);
                        lastDoctorList = doctorsResult;
                        // Fetch doctor list again to safely extract ID & name (important fix)
                        try {
                            const response = yield axios_1.default.get(`https://api.swastify.life/patient/get-doctors?${new URLSearchParams(toolCall.params).toString()}`, {
                                headers: {
                                    Cookie: `auth_token=${AUTH_TOKEN}`,
                                },
                            });
                            const doctors = response.data.doctors;
                            if (doctors.length === 1) {
                                lastDoctorId = doctors[0].id;
                                lastDoctorName = doctors[0].name;
                            }
                            else {
                                // If multiple or none, reset
                                lastDoctorId = "";
                                lastDoctorName = "";
                            }
                        }
                        catch (err) {
                            console.error("❌ Failed to extract doctorId:", err);
                            lastDoctorId = "";
                            lastDoctorName = "";
                        }
                        messages.push({ role: "assistant", content: llamaReply });
                        messages.push({
                            role: "tool",
                            content: `Result from getDoctors tool:\n${doctorsResult}`,
                        });
                        console.log(`\n📋 Doctors found:\n${doctorsResult}`);
                        break;
                    case "getAvailableDates":
                        console.log("🛠️ Tool Triggered: getAvailableDates");
                        // Use doctorId from params or fallback to lastDoctorId
                        if (!toolCall.params.doctorId) {
                            if (lastDoctorId) {
                                toolCall.params.doctorId = lastDoctorId;
                            }
                            else {
                                console.log("❌ Doctor ID not provided and no previous doctor selected.");
                                messages.push({ role: "assistant", content: "Doctor ID missing for available dates." });
                                break;
                            }
                        }
                        const datesResult = yield getAvailableDates(toolCall.params);
                        lastAvailableDates = datesResult;
                        messages.push({ role: "assistant", content: llamaReply });
                        messages.push({
                            role: "tool",
                            content: `Result from getAvailableDates tool:\n${datesResult}`,
                        });
                        console.log(`\n📅 ${datesResult}`);
                        break;
                    case "getAvailableSlots":
                        console.log("🛠️ Tool Triggered: getAvailableSlots");
                        // Validate params
                        if (!toolCall.params.doctorId) {
                            if (lastDoctorId) {
                                toolCall.params.doctorId = lastDoctorId;
                            }
                            else {
                                console.log("❌ Doctor ID missing for available slots.");
                                messages.push({ role: "assistant", content: "Doctor ID missing for available slots." });
                                break;
                            }
                        }
                        if (!toolCall.params.date) {
                            if (lastSelectedDate) {
                                toolCall.params.date = lastSelectedDate;
                            }
                            else {
                                console.log("❌ Date missing for available slots.");
                                messages.push({ role: "assistant", content: "Date missing for available slots." });
                                break;
                            }
                        }
                        else {
                            lastSelectedDate = toolCall.params.date;
                        }
                        const slotsResult = yield getAvailableSlots(toolCall.params);
                        lastAvailableSlots = slotsResult;
                        messages.push({ role: "assistant", content: llamaReply });
                        messages.push({
                            role: "tool",
                            content: `Result from getAvailableSlots tool:\n${slotsResult}`,
                        });
                        console.log(`\n⏰ ${slotsResult}`);
                        break;
                    case "bookAppointment":
                        console.log("🛠️ Tool Triggered: bookAppointment");
                        // Validate required params and ask for confirmation before booking
                        if (!toolCall.params.doctorId) {
                            if (lastDoctorId)
                                toolCall.params.doctorId = lastDoctorId;
                            else {
                                console.log("❌ doctorId missing for booking.");
                                messages.push({ role: "assistant", content: "doctorId missing for booking appointment." });
                                break;
                            }
                        }
                        if (!toolCall.params.appointmentTime) {
                            console.log("❌ appointmentTime missing for booking.");
                            messages.push({ role: "assistant", content: "appointmentTime missing for booking appointment." });
                            break;
                        }
                        // Show confirmation prompt before booking
                        const apptDateTime = new Date(toolCall.params.appointmentTime);
                        const apptDateStr = apptDateTime.toISOString().slice(0, 10);
                        const apptTimeStr = apptDateTime.toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const confirmation = readline_sync_1.default.question(`📝 Confirm booking appointment with:\n- Doctor: ${lastDoctorName || "Unknown"}\n- Date: ${apptDateStr}\n- Time: ${apptTimeStr} IST\nConfirm? (yes/no): `);
                        if (confirmation.toLowerCase() === "yes") {
                            const bookingResult = yield bookAppointment({
                                patientId,
                                doctorId: toolCall.params.doctorId,
                                appointmentTime: toolCall.params.appointmentTime,
                            });
                            messages.push({ role: "assistant", content: llamaReply });
                            messages.push({ role: "tool", content: `Booking result: ${bookingResult}` });
                            console.log(`\n✅ ${bookingResult}`);
                        }
                        else {
                            console.log("❌ Booking cancelled by user.");
                            messages.push({ role: "assistant", content: "Booking cancelled." });
                        }
                        break;
                    default:
                        console.log("❌ Unknown tool called.");
                        messages.push({ role: "assistant", content: "Unknown tool call." });
                        break;
                }
            }
            else {
                // No tool call, just reply normally
                messages.push({ role: "assistant", content: llamaReply });
                console.log(`\n🤖 Gundu Bhaai: ${llamaReply}`);
            }
        }
    });
}
main();
