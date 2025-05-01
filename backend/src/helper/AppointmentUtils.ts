import { prisma } from "../utils/prismaConnection";

const SLOT_DURATION_MINUTES = 30; // Duration of each appointment slot in minutes

// Function to get doctor's availability for a specific day
export const getDoctorAvailabilityForDay = async (doctorId: string, dayOfWeek: string) => {
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
  
// Define the AppointmentSlot interface
export interface AppointmentSlot {
    startTime: Date;
    endTime: Date;
  }
  

  // Function to generate slots based on the doctor's availability
export  const generateSlotsForAvailability = (availability: any) => {
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
export  const checkForConflicts = async (doctorId: string, newSlot: AppointmentSlot) => {
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
    