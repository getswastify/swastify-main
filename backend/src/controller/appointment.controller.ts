import { Request, Response } from 'express';
import { prisma } from "../utils/prismaConnection";

const SLOT_DURATION_MINUTES = 30; // Duration of each appointment slot in minutes

// Define the AppointmentSlot interface
interface AppointmentSlot {
  startTime: Date;
  endTime: Date;
}

// Function to get doctor's availability for a specific day
const getDoctorAvailabilityForDay = async (doctorId: string, dayOfWeek: string) => {
  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek,
    },
    orderBy: {
      startTime: 'asc', // Sort by start time
    },
  });

  if (availability.length === 0) {
    throw new Error('No availability found for this day.');
  }

  return availability;
};

// Function to generate slots based on the doctor's availability
const generateSlotsForAvailability = (availability: any) => {
    const slots: AppointmentSlot[] = [];
  
    availability.forEach((avail: { startTime: Date; endTime: Date }) => {
      let start = new Date(avail.startTime);
      const end = new Date(avail.endTime);
  
      while (start < end) {
        const slotEnd = new Date(start);
        slotEnd.setMinutes(start.getMinutes() + SLOT_DURATION_MINUTES);
  
        // Only add slot if the end time is within the doctor's availability
        if (slotEnd <= end) {
          slots.push({
            startTime: start,
            endTime: slotEnd,
          });
        }
  
        start = slotEnd; // Move to the next slot
      }
    });
  
    return slots;
  };
  

// Function to check for conflicts with existing appointments
const checkForConflicts = async (doctorId: string, newSlot: AppointmentSlot) => {
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentTime: {
          gte: newSlot.startTime, // Check if the new appointment starts after the existing one
          lt: newSlot.endTime,    // Check if the new appointment ends before the existing one
        },
      },
    });
  
    if (existingAppointments.length > 0) {
      return true; // Conflict exists
    }
  
    return false; // No conflict
  };
  

// API endpoint to get dynamic appointment slots for a doctor
export const getDynamicAppointmentSlots = async (req: Request, res: Response): Promise<any> => {
    try {
      const { doctorId, dayOfWeek } = req.body;

  
      if (!doctorId || !dayOfWeek) {
        return res.status(400).json({ error: 'Doctor ID and dayOfWeek are required.' });
      }
  
      // Step 1: Get doctor's availability for the given day
      const availability = await getDoctorAvailabilityForDay(doctorId, dayOfWeek as string);
  
      // Step 2: Generate dynamic slots for each availability period
      const generatedSlots = generateSlotsForAvailability(availability);
  
      // Step 3: Check for conflicts in each generated slot
      const availableSlots: AppointmentSlot[] = [];
      for (const slot of generatedSlots) {
        const conflict = await checkForConflicts(doctorId, slot);
        if (!conflict) {
          availableSlots.push(slot);
        }
      }
  
      return res.status(200).json({ availableSlots });
    } catch (error) {
      console.error('Error generating appointment slots:', error);
      return res.status(500).json({ error: 'Something went wrong while generating slots.' });
    }
  };
