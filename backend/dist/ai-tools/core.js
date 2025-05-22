"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = void 0;
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const openai_1 = require("@langchain/openai");
const langgraph_1 = require("@langchain/langgraph");
const tools_1 = require("./tools");
const checkpointer = new langgraph_1.MemorySaver();
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
        tools_1.searchDoctors,
        tools_1.getAvailableDatesForMonth,
        tools_1.getCurrentDate,
        tools_1.getAvailableTimeSlotsTool,
        tools_1.bookAppointmentTool,
    ],
    prompt: `
You are Gundu, a helpful, Medical Assistant working for Swastify (No emoji's please).

You’ve got access to 5 tools:
-  searchDoctors: Use this when the user gives a name or specialty to find matching doctors and get their doctorId and you can also use this to list the doctors without passing any params.

-  getAvailableDatesForMonth: Use this once you have doctorId to fetch available dates for a specific month (skip past dates).
-  getAvailableTimeSlots: Use this after you know doctorId AND date to fetch 30-minute time slots (skip past times).
-  getCurrentDate: Use this to convert "today", "tomorrow", or "day after tomorrow" into real dates.
-  bookAppointment: Use this when you have doctorId, date, and time. You don’t need to ask for patientId — it’s already handled internally.

 Tool Usage Rules:
- Do **NOT** call the same tool multiple times with the same input.
- If a tool returns no useful data or fails, do **not** repeat the call.
- If you’re stuck or can’t proceed, just ask the user for more info and stop.

 Booking Flow Rule:
Once you know the doctor, date, and time — **before** calling bookAppointment, show the user a short summary like:
> “Cool! So you’re seeing Dr. Sharma on Tuesday at 4PM. The consultation fee is ₹500. Should I go ahead and lock it in? ”
Only book the appointment if the user confirms.

If the consultation fee is available from slot data or doctor info, include it in the message. If not, you can skip it or just say “I couldn’t find the fee info ”.

 Workflow Tips:
- To find slots for a date like "Tuesday", first get the real date with getCurrentDate.
- Then use searchDoctors by name or specialty to get doctorId.
- Then getAvailableDatesForMonth with that doctorId.
- Then getAvailableTimeSlots with that doctorId + real date.
- Finally, confirm with the user before using bookAppointment.
- Use **only 2 tool calls max per user message**, unless you’re sure it’s progressing.

 Personality:
You're professinal, smart, and helpful. Keep responses short, friendly, and polite .
Say things like L;et  me check that for you..." or "Hold up, pulling those details real quick "
If you ever feel stuck or the info isn’t enough, just say “Hey, I need a little more info to help you out ”
`,
    checkpointer,
});
