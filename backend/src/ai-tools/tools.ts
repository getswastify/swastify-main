import axios from "axios"
import {config} from "dotenv"
import { tool } from "@langchain/core/tools";
import {z} from "zod"

config()

const authToken = process.env.AUTH_TOKEN


type SlotInput = {
  doctorId: string;
  date: string; // YYYY-MM-DD
};

export async function getAvailableTimeSlots({ doctorId, date }: SlotInput) {
  try {
    const response = await axios.post(
      `${process.env.API_URL}/patient/available-slots`,
      {
        doctorId,
        date,
      }
    );

    return response.data.availableSlots;
  } catch (err: any) {
    console.error("🛑 Slot API error:", err.response?.data || err.message);
    return [];
  }
}


export const searchDoctors = tool<any>(
  async (input: { search?: string; specialty?: string }) => {
    try {
      const params: Record<string, string> = {};
      if (input.search) params.search = input.search;
      if (input.specialty) params.specialty = input.specialty;

      const res = await axios.get(`${process.env.API_URL}/patient/get-doctors`, {
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
  .map(
    (doc: any, i: number) =>
      `${i + 1}. Dr. ${doc.name} (ID: ${doc.userId}) - ${doc.specialty} (${doc.experience} years), Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`
  )
  .join("\n");


      return `Here are the doctors I found:\n\n${doctorsList}`;
    } catch (error) {
      console.error("Error searching doctors:", error);
      return "Sorry, I couldn't search doctors right now. Try again later.";
    }
  },
  {
    name: "searchDoctors",
    description: "Search doctors by name and/or specialty.",
    schema: z.object({
      search: z.string().optional().describe("Doctor name to search for"),
      specialty: z.string().optional().describe("Specialty to filter doctors"),
    }),
  }
);

export const getAvailableDatesForMonth = tool<any>(
  async (input: { doctorId: string; year: number; month: number }) => {
    try {
      const { doctorId, year, month } = input;

      

      const res = await axios.get(
        `${process.env.API_URL}/patient/available-dates`, // put the actual endpoint URL here
        {
          params: { doctorId, year, month },
          headers: {
            Cookie: `auth_token=${authToken}`,
          },
        }
      );

      const data = res.data;

      if (!data.availableDates || data.availableDates.length === 0) {
        return `No available dates found for doctor ${doctorId} in ${month}/${year}.`;
      }

      const datesList = data.availableDates.join(", ");

      return `Available dates for doctor ${doctorId} in ${month}/${year} are:\n${datesList}`;
    } catch (error) {
      console.error("Error fetching available dates:", error);
      return "Sorry, I couldn't fetch available dates right now. Try again later.";
    }
  },
  {
    name: "getAvailableDatesForMonth",
    description: "Get available appointment dates for a doctor in a specific month and year.",
    schema: z.object({
      doctorId: z.string().describe("The ID of the doctor"),
      year: z.number().int().describe("Year as a 4-digit number, e.g., 2025"),
      month: z.number().int().min(1).max(12).describe("Month as a number between 1 and 12"),
    }),
  }
);

export const getCurrentDate = tool<any>(
  async () => {
    const today = new Date();

    const format = (date: Date) =>
      date.toLocaleDateString("en-IN", {
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
  },
  {
    name: "getCurrentDate",
    description: "Get today's, tomorrow's, and day after tomorrow's date in DD/MM/YYYY format.",
    schema: z.object({}),
  }
);


export const getAvailableTimeSlotsTool = tool<any>(
  async (input: SlotInput) => {
    const { doctorId, date } = input;
    const slots = await getAvailableTimeSlots({ doctorId, date });

    if (slots.length === 0) {
      return `No available slots for doctor ${doctorId} on ${date} `;
    }

    return `Available slots for ${date}:\n${slots.map((s: any) => s.displayTime).join(", ")}`;
  },
  {
    name: "getAvailableTimeSlots",
    description: "Get 30-minute available appointment time slots for a doctor on a specific date.",
    schema: z.object({
      doctorId: z.string().describe("The ID of the doctor"),
      date: z.string().describe("The date in YYYY-MM-DD format"),
    }),
  }
);

export const bookAppointmentTool = tool<any>(
  async (input: { doctorId: string; date: string; time: string }) => {
    try {
      const { doctorId, date, time } = input;

      const patientId = process.env.PATIENT_ID;
      if (!patientId) throw new Error("Missing PATIENT_ID in environment variables");

      const toAppointmentTime = (date: string, time: string): string => {
        const dateTimeString = `${date} ${time}`;
        const dateObj = new Date(dateTimeString); // local time
        return dateObj.toISOString(); // backend expects UTC ISO
      };

      const appointmentTime = toAppointmentTime(date, time);

      const res = await axios.post(`${process.env.API_URL}/patient/book-appointment`, {
        doctorId,
        patientId,
        appointmentTime,
      }, {
        headers: {
          Cookie: `auth_token=${authToken}`,
        },
      });

      return ` Appointment booked with doctor ${doctorId} for ${date} at ${time} (IST)!`;
    } catch (error: any) {
      console.error("Error booking appointment:", error?.response?.data || error.message);
      return `❌ Failed to book the appointment. Try again later or check your input.`;
    }
  },
  {
    name: "bookAppointment",
    description: "Book an appointment for a patient with a doctor on a specific date and time.",
    schema: z.object({
      doctorId: z.string().describe("The ID of the doctor"),
      date: z.string().describe("The date of the appointment in YYYY-MM-DD format"),
      time: z.string().describe("The time of the appointment in HH:MM AM/PM format (IST)"),
    }),
  }
);