import type { Request, Response } from "express"
import { prisma } from "../utils/prismaConnection"

const formatSuccess = (message: string, data: any = null) => ({
  status: true,
  message,
  data,
})

const formatError = (message: string, error: any = null) => ({
  status: false,
  message,
  error,
})

// Consistent function to build date-time with IST offset
const buildDateTimeFromTimeString = (dayOfWeek: string, timeStr: string): Date => {
  const now = new Date()
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDayIndex = now.getDay()
  const targetDayIndex = daysOfWeek.indexOf(dayOfWeek)
  if (targetDayIndex === -1) throw new Error("Invalid dayOfWeek")
  const diff = (targetDayIndex - currentDayIndex + 7) % 7

  // Construct a date string in IST (India is always UTC+5:30, no DST)
  const [hours, minutes] = timeStr.split(":")
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + diff)
  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, "0")
  const day = String(targetDate.getDate()).padStart(2, "0")

  // Store as UTC time but with the correct offset from IST
  // This means we subtract 5:30 from the IST time to get the equivalent UTC time
  const utcHours = Number.parseInt(hours) - 5
  const utcMinutes = Number.parseInt(minutes) - 30

  // Handle minute underflow
  let adjustedHours = utcHours
  let adjustedMinutes = utcMinutes

  if (adjustedMinutes < 0) {
    adjustedMinutes += 60
    adjustedHours -= 1
  }

  // Handle hour underflow (might go to previous day)
  if (adjustedHours < 0) {
    adjustedHours += 24
    // Adjust the day if needed (subtract 1 day)
    targetDate.setDate(targetDate.getDate() - 1)
  }

  const utcDateStr = `${year}-${month}-${day}T${String(adjustedHours).padStart(2, "0")}:${String(adjustedMinutes).padStart(2, "0")}:00Z`
  return new Date(utcDateStr)
}

export const getDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId
    if (!doctorId) {
      return res.status(400).json(formatError("Doctor ID is required."))
    }

    const availability = await prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: { startTime: "asc" },
    })

    if (availability.length === 0) {
      return res.status(404).json(formatError("No availability found for the doctor."))
    }

    return res.status(200).json(formatSuccess("Availability fetched successfully.", availability))
  } catch (error) {
    console.error("Error fetching doctor availability:", error)
    return res.status(500).json(formatError("Something went wrong while fetching availability.", error))
  }
}

export const setDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId
    if (!doctorId) {
      return res.status(400).json(formatError("Doctor ID is required."))
    }

    const { dayOfWeek, timeSlots } = req.body

    if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json(formatError("Invalid input. Please provide dayOfWeek and timeSlots."))
    }

    // Check for overlapping slots
    const isOverlapping = (startA: Date, endA: Date, startB: Date, endB: Date): boolean => {
      return startA < endB && startB < endA
    }

    const availabilityData = timeSlots.map((slot: { startTime: string; endTime: string }) => ({
      doctorId,
      dayOfWeek,
      startTime: buildDateTimeFromTimeString(dayOfWeek, slot.startTime),
      endTime: buildDateTimeFromTimeString(dayOfWeek, slot.endTime),
    }))

    // Check for conflicts between provided time slots
    for (let i = 0; i < availabilityData.length; i++) {
      for (let j = i + 1; j < availabilityData.length; j++) {
        if (
          isOverlapping(
            availabilityData[i].startTime,
            availabilityData[i].endTime,
            availabilityData[j].startTime,
            availabilityData[j].endTime,
          )
        ) {
          return res.status(400).json(formatError("Conflict between provided time slots."))
        }
      }
    }

    // Check for existing availability on the same day
    const existingAvailability = await prisma.doctorAvailability.findMany({
      where: { doctorId, dayOfWeek },
    })

    if (existingAvailability.length > 0) {
      return res.status(400).json(formatError("Availability for this day already exists."))
    }

    // Create new availability
    await prisma.doctorAvailability.createMany({ data: availabilityData })

    return res.status(201).json(formatSuccess("Availability set successfully."))
  } catch (error) {
    console.error("Error setting doctor availability:", error)
    return res.status(500).json(formatError("Something went wrong while setting availability.", error))
  }
}

export const updateDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId
    if (!doctorId) {
      return res.status(400).json(formatError("Doctor ID is required."))
    }

    const { dayOfWeek, timeSlots } = req.body

    if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json(formatError("Invalid input. Please provide dayOfWeek and timeSlots."))
    }

    const existingAvailability = await prisma.doctorAvailability.findMany({
      where: { doctorId, dayOfWeek },
    })

    if (existingAvailability.length === 0) {
      return res.status(400).json(formatError("First create availability for this day before updating it."))
    }

    const isOverlapping = (startA: Date, endA: Date, startB: Date, endB: Date): boolean => {
      return startA < endB && startB < endA
    }

    const availabilityData = timeSlots.map((slot: { startTime: string; endTime: string }) => ({
      doctorId,
      dayOfWeek,
      startTime: buildDateTimeFromTimeString(dayOfWeek, slot.startTime),
      endTime: buildDateTimeFromTimeString(dayOfWeek, slot.endTime),
    }))

    for (let i = 0; i < availabilityData.length; i++) {
      for (let j = i + 1; j < availabilityData.length; j++) {
        if (
          isOverlapping(
            availabilityData[i].startTime,
            availabilityData[i].endTime,
            availabilityData[j].startTime,
            availabilityData[j].endTime,
          )
        ) {
          return res.status(400).json(formatError("Conflict between provided time slots."))
        }
      }
    }

    await prisma.doctorAvailability.deleteMany({
      where: { doctorId, dayOfWeek },
    })

    await prisma.doctorAvailability.createMany({ data: availabilityData })

    return res.status(200).json(formatSuccess("Availability updated successfully."))
  } catch (error) {
    console.error("Error updating doctor availability:", error)
    return res.status(500).json(formatError("Something went wrong while updating availability.", error))
  }
}

export const deleteDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId
    if (!doctorId) {
      return res.status(400).json(formatError("Doctor ID is required."))
    }

    const { availabilityId } = req.body
    if (!availabilityId) {
      return res.status(400).json(formatError("Availability ID is required."))
    }

    const availability = await prisma.doctorAvailability.findUnique({
      where: { id: availabilityId },
    })

    if (!availability) {
      return res.status(404).json(formatError("Availability slot not found."))
    }

    if (availability.doctorId !== doctorId) {
      return res.status(403).json(formatError("You are not authorized to delete this availability."))
    }

    await prisma.doctorAvailability.delete({  
      where: { id: availabilityId },
    })

    return res.status(200).json(formatSuccess("Availability slot deleted successfully."))
  } catch (error) {
    console.error("Error deleting doctor availability:", error)
    return res.status(500).json(formatError("Something went wrong while deleting availability.", error))
  }
}
