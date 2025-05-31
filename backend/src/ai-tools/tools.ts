import axios from "axios"
import { config } from "dotenv"
import { tool } from "@langchain/core/tools"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { getCurrentAuthToken } from "./authContext" // Import the function to get the current auth token

config()


type SlotInput = {
  doctorId: string
  date: string // YYYY-MM-DD
  auth_token?: string // Make auth_token optional
}

export async function getAvailableTimeSlots({ doctorId, date }: SlotInput) {
  try {
    // Get the auth token from the current context
    const auth_token = getCurrentAuthToken()
    console.log("Using auth token for time slots:", auth_token) // Log the token being used

    const response = await axios.post(
      `${process.env.API_URL}/patient/available-slots`,
      {
        doctorId,
        date,
      },
      {
        headers: {
          Cookie: `auth_token=${auth_token}`,
        },
      },
    )

    return response.data.availableSlots
  } catch (err: any) {
    console.error("🛑 Slot API error:", err.response?.data || err.message)
    return []
  }
}

// Update the searchDoctors tool to get the auth token from the current context
export const searchDoctors = tool<any>(
  async (input: { search?: string; specialty?: string }) => {
    try {
      const { search, specialty } = input

      // Get the auth token from the current context
      const auth_token = getCurrentAuthToken()
      console.log("Searching doctors with params:", { search, specialty })
      console.log("Using auth token for search:", auth_token) // Log the token being used

      const params: Record<string, string> = {}
      if (search) params.search = search
      if (specialty) params.specialty = specialty

      const res = await axios.get(`${process.env.API_URL}/patient/get-doctors`, {
        params,
        headers: {
          Cookie: `auth_token=${auth_token}`, // Use the actual token
        },
      })

      const data = res.data

      if (!data.doctors || data.doctors.length === 0) {
        return "No doctors matched your search criteria."
      }

      const doctorsList = data.doctors
        .map(
          (doc: any, i: number) =>
            `${i + 1}. Dr. ${doc.name} (ID: ${doc.userId}) - ${doc.specialty} (${doc.experience} years), Fee: ₹${doc.consultationFee}, Clinic: ${doc.clinicAddress}`,
        )
        .join("\n")

      return `Here are the doctors I found:\n\n${doctorsList}`
    } catch (error) {
      console.error("Error searching doctors:", error)
      return "Sorry, I couldn't search doctors right now. Try again later."
    }
  },
  {
    name: "searchDoctors",
    description: "Search doctors by name and/or specialty.",
    schema: z.object({
      search: z.string().optional().describe("Doctor name to search for"),
      specialty: z.string().optional().describe("Specialty to filter doctors"),
    }),
  },
)

export const getAvailableDatesForMonth = tool<any>(
  async (input: { doctorId: string; year: number; month: number }) => {
    try {
      const { doctorId, year, month } = input

      // Get the auth token from the current context
      const auth_token = getCurrentAuthToken()
      console.log("Using auth token for dates:", auth_token) // Log the token being used

      const res = await axios.get(`${process.env.API_URL}/patient/available-dates`, {
        params: { doctorId, year, month },
        headers: {
          Cookie: `auth_token=${auth_token}`,
        },
      })

      const data = res.data

      if (!data.availableDates || data.availableDates.length === 0) {
        return `No available dates found for doctor ${doctorId} in ${month}/${year}.`
      }

      const datesList = data.availableDates.join(", ")

      return `Available dates for doctor ${doctorId} in ${month}/${year} are:\n${datesList}`
    } catch (error) {
      console.error("Error fetching available dates:", error)
      return "Sorry, I couldn't fetch available dates right now. Try again later."
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
  },
)

export const getCurrentDate = tool<any>(
  async () => {
    const now = new Date()
    now.setSeconds(0, 0) // Clean up time

    const format = (date: Date) =>
      date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })

    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const dayAfter = new Date(today)
    dayAfter.setDate(today.getDate() + 2)

    // If today is already passed (like it's 11PM and system logic skips it), skip it
    const results: string[] = []

    const nowHour = now.getHours()
    const nowMinute = now.getMinutes()

    // 🧠 Add 'today' only if we're before 11PM — adjust threshold if needed
    if (nowHour < 23) {
      results.push(`- Today: ${format(today)}`)
    }

    results.push(`- Tomorrow: ${format(tomorrow)}`)
    results.push(`- Day after tomorrow: ${format(dayAfter)}`)

    return `🗓️ Dates are as follows:\n${results.join("\n")}`
  },
  {
    name: "getCurrentDate",
    description:
      "Get today's, tomorrow's, and day after tomorrow's date in DD/MM/YYYY format. Skips today if it's too late.",
    schema: z.object({}),
  },
)

export const getAvailableTimeSlotsTool = tool<any>(
  async (input: { doctorId: string; date: string }) => {
    const { doctorId, date } = input

    // Get the auth token from the current context
    const auth_token = getCurrentAuthToken()
    console.log("Using auth token for time slots tool:", auth_token) // Log the token being used

    const slots = await getAvailableTimeSlots({ doctorId, date })

    if (slots.length === 0) {
      return `No available slots for doctor ${doctorId} on ${date} `
    }

    return `Available slots for ${date}:\n${slots.map((s: any) => s.displayTime).join(", ")}`
  },
  {
    name: "getAvailableTimeSlots",
    description: "Get 30-minute available appointment time slots for a doctor on a specific date.",
    schema: z.object({
      doctorId: z.string().describe("The ID of the doctor"),
      date: z.string().describe("The date in YYYY-MM-DD format"),
    }),
  },
)

// Update the bookAppointmentTool to get the auth token from the current context
export const bookAppointmentTool = tool<any>(
  async (input: { doctorId: string; date: string; time: string }) => {
    try {
      let patientId = null
      const { doctorId, date, time } = input

      // Get the auth token from the current context
      const auth_token = getCurrentAuthToken()
      console.log("Using auth token for booking:", auth_token) // Log the token being used

      jwt.verify(auth_token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
        if (err) {
          console.error("JWT verification error:", err)
          throw new Error("Invalid auth token")
        }
        // console.log("Decoded JWT:", decoded);
        patientId = decoded.userId // Extract patientId from the decoded token
      })
      console.log("Booking appointment with params:", { doctorId, date, time, patientId })

      if (!doctorId) throw new Error("Missing doctorId in input")
      if (!date) throw new Error("Missing date in input")
      if (!patientId) throw new Error("Missing patientId in input")

      const toAppointmentTime = (date: string, time: string): string => {
        const dateTimeString = `${date} ${time}`
        const dateObj = new Date(dateTimeString) // local time
        return dateObj.toISOString() // backend expects UTC ISO
      }

      const appointmentTime = toAppointmentTime(date, time)

      const res = await axios.post(
        `${process.env.API_URL}/patient/book-appointment`,
        {
          doctorId,
          patientId,
          appointmentTime,
        },
        {
          headers: {
            Cookie: `auth_token=${auth_token}`, // Use the actual token
          },
        },
      )

      return `✅ Appointment booked with doctor ${doctorId} for ${date} at ${time} (IST)!`
    } catch (error: any) {
      console.error("❌ Error booking appointment:", error?.response?.data || error.message)
      return `❌ Failed to book the appointment. Try again later or check your input.`
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
  },
)