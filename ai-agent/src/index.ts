import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import readlineSync from "readline-sync";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3-8b-instruct";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

interface AvailableSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
}

interface AppointmentResponse {
  message: string;
  appointment: any;
}

async function askLlama(messages: Message[]): Promise<string> {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "SwastifyAgent",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (err: any) {
    console.error("❌ Error:", err.response?.data || err.message);
    return "Oops, something went wrong.";
  }
}

async function getDoctorsFromSwastify(params: { search?: string; specialty?: string }): Promise<string> {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await axios.get(
      `https://api.swastify.life/patient/get-doctors?${query}`,
      {
        headers: {
          Cookie: `auth_token=${AUTH_TOKEN}`,
        },
      }
    );

    const doctors = response.data.doctors;
    if (!doctors.length) return "No doctors found, Bhau 😔";

    return doctors
      .map((doc: any, i: number) => {
        return `${i + 1}. ${doc.name} — ${doc.specialty}, ${doc.experience} yrs exp, Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`;
      })
      .join("\n");
  } catch (err: any) {
    console.error("❌ Doctor fetch failed:", err.response?.data || err.message);
    return "Unable to fetch doctors right now.";
  }
}

async function getAvailableDates(params: { doctorId: string; year?: number; month?: number }): Promise<string> {
  try {
    // Proper fallback for year and month
    const now = new Date();
    const year = params.year ?? now.getFullYear();
    const month = params.month ?? now.getMonth() + 1; // month is 1-based for API

    // Validate doctorId presence
    if (!params.doctorId) {
      return "Doctor ID missing for fetching available dates.";
    }

    const query = new URLSearchParams({
      doctorId: params.doctorId,
      year: year.toString(),
      month: month.toString(),
    }).toString();

    const response = await axios.get(`https://api.swastify.life/patient/available-dates?${query}`, {
      headers: {
        Cookie: `auth_token=${AUTH_TOKEN}`,
      },
    });

    const availableDates = response.data.availableDates as string[];

    if (!availableDates || availableDates.length === 0) {
      return `No available dates found for the doctor in ${month}/${year}, Bhau 😔`;
    }

    return `Available dates for the doctor in ${month}/${year} are:\n${availableDates.join(", ")}`;
  } catch (err: any) {
    console.error("❌ Fetching available dates failed:", err.response?.data || err.message);
    return "Unable to fetch available dates right now.";
  }
}

async function getAvailableSlots(params: { doctorId: string; date: string }): Promise<string> {
  try {
    if (!params.doctorId || !params.date) {
      return "doctorId or date missing for fetching available slots.";
    }

    const response = await axios.post(
      "https://api.swastify.life/patient/available-slots",
      {
        doctorId: params.doctorId,
        date: params.date,
      },
      {
        headers: {
          Cookie: `auth_token=${AUTH_TOKEN}`,
        },
      }
    );

    const availableSlots: AvailableSlot[] = response.data.availableSlots;

    if (!availableSlots || availableSlots.length === 0) {
      return `No available appointment slots found for the doctor on ${params.date}, Bhau 😔`;
    }

    return (
      `Available appointment slots on ${params.date} are:\n` +
      availableSlots.map((slot, i) => `${i + 1}. ${slot.displayTime}`).join("\n")
    );
  } catch (err: any) {
    console.error("❌ Fetching available slots failed:", err.response?.data || err.message);
    return "Unable to fetch available appointment slots right now.";
  }
}

async function bookAppointment(params: {
  patientId: string;
  doctorId: string;
  appointmentTime: string; // ISO UTC string
}): Promise<string> {
  try {
    const response = await axios.post<AppointmentResponse>(
      "https://api.swastify.life/patient/book-appointment",
      {
        patientId: params.patientId,
        doctorId: params.doctorId,
        appointmentTime: params.appointmentTime,
      },
      {
        headers: {
          Cookie: `auth_token=${AUTH_TOKEN}`,
        },
      }
    );

    return `✅ Appointment booked successfully for ${new Date(params.appointmentTime).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      dateStyle: "medium",
      timeStyle: "short",
    })}! The doctor will be notified.`;
  } catch (err: any) {
    console.error("❌ Booking appointment failed:", err.response?.data || err.message);

    if (err.response?.data?.error) {
      return `Booking failed: ${err.response.data.error}`;
    }
    return "Something went wrong while booking your appointment. Try again later.";
  }
}

// Parse tool calls from LLM replies with strict JSON parsing
function parseToolCall(content: string): { tool: string; params: any } | null {
  const regex = /\[\[CALL_TOOL:\s*(getDoctors|getAvailableDates|getAvailableSlots|bookAppointment)\s*(\{[\s\S]*?\})\s*\]\]/;
  const match = content.match(regex);
  if (!match) return null;
  try {
    const tool = match[1];
    const params = JSON.parse(match[2]);
    return { tool, params };
  } catch (err) {
    console.error("❌ Failed to parse tool params:", err);
    return null;
  }
}

async function main(): Promise<void> {
  console.log("\n🧠 Swastify AI Agent ready! Type 'exit' to stop.");

  const messages: Message[] = [
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
    const input = readlineSync.question("\n👤 You: ");
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    const llamaReply = await askLlama(messages);
    const toolCall = parseToolCall(llamaReply);

    if (toolCall) {
      switch (toolCall.tool) {
        case "getDoctors":
          console.log("🛠️ Tool Triggered: getDoctors");
          const doctorsResult = await getDoctorsFromSwastify(toolCall.params);
          lastDoctorList = doctorsResult;

          // Fetch doctor list again to safely extract ID & name (important fix)
          try {
            const response = await axios.get(
              `https://api.swastify.life/patient/get-doctors?${new URLSearchParams(toolCall.params).toString()}`,
              {
                headers: {
                  Cookie: `auth_token=${AUTH_TOKEN}`,
                },
              }
            );
            const doctors = response.data.doctors;
            if (doctors.length === 1) {
              lastDoctorId = doctors[0].id;
              lastDoctorName = doctors[0].name;
            } else {
              // If multiple or none, reset
              lastDoctorId = "";
              lastDoctorName = "";
            }
          } catch (err) {
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
            } else {
              console.log("❌ Doctor ID not provided and no previous doctor selected.");
              messages.push({ role: "assistant", content: "Doctor ID missing for available dates." });
              break;
            }
          }

          const datesResult = await getAvailableDates(toolCall.params);
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
            } else {
              console.log("❌ Doctor ID missing for available slots.");
              messages.push({ role: "assistant", content: "Doctor ID missing for available slots." });
              break;
            }
          }
          if (!toolCall.params.date) {
            if (lastSelectedDate) {
              toolCall.params.date = lastSelectedDate;
            } else {
              console.log("❌ Date missing for available slots.");
              messages.push({ role: "assistant", content: "Date missing for available slots." });
              break;
            }
          } else {
            lastSelectedDate = toolCall.params.date;
          }

          const slotsResult = await getAvailableSlots(toolCall.params);
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
            if (lastDoctorId) toolCall.params.doctorId = lastDoctorId;
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

          const confirmation = readlineSync.question(
            `📝 Confirm booking appointment with:\n- Doctor: ${lastDoctorName || "Unknown"}\n- Date: ${apptDateStr}\n- Time: ${apptTimeStr} IST\nConfirm? (yes/no): `
          );

          if (confirmation.toLowerCase() === "yes") {
            const bookingResult = await bookAppointment({
              patientId,
              doctorId: toolCall.params.doctorId,
              appointmentTime: toolCall.params.appointmentTime,
            });

            messages.push({ role: "assistant", content: llamaReply });
            messages.push({ role: "tool", content: `Booking result: ${bookingResult}` });
            console.log(`\n✅ ${bookingResult}`);
          } else {
            console.log("❌ Booking cancelled by user.");
            messages.push({ role: "assistant", content: "Booking cancelled." });
          }
          break;

        default:
          console.log("❌ Unknown tool called.");
          messages.push({ role: "assistant", content: "Unknown tool call." });
          break;
      }
    } else {
      // No tool call, just reply normally
      messages.push({ role: "assistant", content: llamaReply });
      console.log(`\n🤖 Gundu Bhaai: ${llamaReply}`);
    }
  }
}

main();
