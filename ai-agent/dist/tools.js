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
exports.toolCallHandler = exports.initTools = exports.tools = void 0;
const axios_1 = __importDefault(require("axios"));
// TODO: Replace with secure retrieval of the auth token, e.g., from environment variables or config
const AUTH_TOKEN = process.env.AUTH_TOKEN || "";
exports.tools = {
    getDoctorsFromSwastify: (params) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const query = new URLSearchParams(params).toString();
            const res = yield axios_1.default.get(`https://api.swastify.life/patient/get-doctors?${query}`, { headers: { Cookie: `auth_token=${AUTH_TOKEN}` } });
            const doctors = res.data.doctors;
            if (!(doctors === null || doctors === void 0 ? void 0 : doctors.length))
                return "No doctors found 😔";
            return doctors
                .map((doc, i) => `${i + 1}. ${doc.name} (${doc.specialty}) - ₹${doc.consultationFee}`)
                .join("\n");
        }
        catch (err) {
            console.error("❌ Fetch doctors error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return "Failed to fetch doctors 💀";
        }
    }),
    getAvailableDates: (_a) => __awaiter(void 0, [_a], void 0, function* ({ doctorId, year, month, }) {
        var _b;
        try {
            const now = new Date();
            const y = year || now.getFullYear();
            const m = month || now.getMonth() + 1;
            const query = new URLSearchParams({ doctorId, year: y.toString(), month: m.toString() }).toString();
            const res = yield axios_1.default.get(`https://api.swastify.life/patient/available-dates?${query}`, { headers: { Cookie: `auth_token=${AUTH_TOKEN}` } });
            const availableDates = res.data.availableDates;
            return availableDates.length
                ? `Available dates: ${availableDates.join(", ")}`
                : "No available dates found for this month 😐";
        }
        catch (err) {
            console.error("❌ Fetch dates error:", ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
            return "Unable to fetch dates 🚫";
        }
    }),
    getAvailableSlots: (_a) => __awaiter(void 0, [_a], void 0, function* ({ doctorId, date, }) {
        var _b;
        try {
            const res = yield axios_1.default.post("https://api.swastify.life/patient/available-slots", { doctorId, date }, { headers: { Cookie: `auth_token=${AUTH_TOKEN}` } });
            const slots = res.data.availableSlots;
            return slots.length
                ? `Available slots on ${date}:\n${slots.map((s, i) => `${i + 1}. ${s.displayTime}`).join("\n")}`
                : "No slots available on that date 😵";
        }
        catch (err) {
            console.error("❌ Fetch slots error:", ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
            return "Unable to fetch slots 🛑";
        }
    }),
    bookAppointment: (_a) => __awaiter(void 0, [_a], void 0, function* ({ doctorId, patientId, appointmentTime, }) {
        var _b;
        try {
            const res = yield axios_1.default.post("https://api.swastify.life/patient/book-appointment", { doctorId, patientId, appointmentTime }, { headers: { Cookie: `auth_token=${AUTH_TOKEN}` } });
            const date = new Date(appointmentTime).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                hour12: true,
                dateStyle: "medium",
                timeStyle: "short",
            });
            return `✅ Appointment booked for ${date}! 🎉`;
        }
        catch (err) {
            console.error("❌ Booking error:", ((_b = err.response) === null || _b === void 0 ? void 0 : _b.data) || err.message);
            return "Booking failed. Try again later 💔";
        }
    })
};
const initTools = () => {
    // Load any configs if needed later
};
exports.initTools = initTools;
const toolCallHandler = (toolCall) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, args } = toolCall;
    if (exports.tools[name])
        return yield exports.tools[name](args[0]);
    throw new Error(`Unknown tool: ${name}`);
});
exports.toolCallHandler = toolCallHandler;
