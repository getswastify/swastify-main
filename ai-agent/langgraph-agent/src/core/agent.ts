// src/core/agent.ts
import { agent } from "./core"
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AzureChatOpenAI } from "@langchain/openai";
import { config } from "dotenv";
import readlineSync from "readline-sync";
import axios from "axios"
import { MemorySaver } from "@langchain/langgraph";
import { getAvailableTimeSlots } from "../tools/tools";


const authToken = process.env.AUTH_TOKEN

const searchDoctors = tool(
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

const getAvailableDatesForMonth = tool(
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

const getCurrentDate = tool(
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

type SlotInput = {
  doctorId: string;
  date: string; // YYYY-MM-DD
};

const getAvailableTimeSlotsTool = tool(
  async (input: SlotInput) => {
    const { doctorId, date } = input;
    const slots = await getAvailableTimeSlots({ doctorId, date });

    if (slots.length === 0) {
      return `No available slots for doctor ${doctorId} on ${date} 😔`;
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

const threadId = "gundu-main-thread";

const globalMessages: { role: "user" | "assistant"; content: string }[] = [];

export async function handleUserMessage(userInput: string): Promise<string> {
  // Push user message
  globalMessages.push({ role: 'user', content: userInput });

  const response = await agent.invoke(
    {
      messages: globalMessages,
    },
    {
      configurable: {
        thread_id: threadId,
      },
    }
  );

  // Extract latest assistant message
  const assistantMsg = response.messages[response.messages.length - 1];

  const assistantContent =
    typeof assistantMsg.content === 'string'
      ? assistantMsg.content
      : Array.isArray(assistantMsg.content)
      ? assistantMsg.content.map((c: any) => (typeof c === 'string' ? c : c.text ?? '')).join(' ')
      : '';

  // Push assistant reply
  globalMessages.push({
    role: 'assistant',
    content: assistantContent,
  });

  return assistantContent;
}       