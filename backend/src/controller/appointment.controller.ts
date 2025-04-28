import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';
import { DoctorAvailabilitySchema } from "../zodSchemas/AppointmentSchema";
import { isBefore } from 'date-fns';

export const getDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.userId; // The userId from the authenticated user
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated or invalid userId',
      });
    }
  
    try {
      // Step 1: Find the doctor's profile using the userId
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: userId },  // Match with the userId in the DoctorProfile table
      });
  
      if (!doctorProfile) {
        return res.status(404).json({
          status: false,
          message: 'Doctor profile not found for this user',
          error: {
            code: 'DOCTOR_NOT_FOUND',
            issue: `No doctor profile found for userId: ${userId}`,
          },
        });
      }
  
      const doctorId = doctorProfile.userId;  // This is the doctorId
  
      // Step 2: Get the doctor's availability with timeSlots
      const availability = await prisma.doctorAvailability.findMany({
        where: {
          doctorId,
        },
        include: {
          timeSlots: true,  // Ensure you're also fetching timeSlots related to the availability
        },
        orderBy: {
          dayOfWeek: 'asc', // Ordering by day of the week
        },
      });
  
      if (availability.length === 0) {
        return res.status(404).json({
          status: false,
          message: 'No availability set for this doctor',
          error: {
            code: 'AVAILABILITY_NOT_FOUND',
            issue: `No availability found for doctorId: ${doctorId}`,
          },
        });
      }
  
      return res.status(200).json({
        status: true,
        message: 'Doctor availability fetched successfully',
        data: availability,
      });
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while fetching doctor availability.',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

export const setDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated or invalid userId',
      });
    }
  
    const validation = DoctorAvailabilitySchema.safeParse(req.body);
  
    if (!validation.success) {
      return res.status(400).json({
        status: false,
        message: validation.error.errors.map(err => err.message).join(', '),
        error: {
          code: 'VALIDATION_ERROR',
          issue: validation.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }
  
    const { dayOfWeek, timeSlots } = validation.data;
  
    try {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: userId },
      });
  
      if (!doctorProfile) {
        return res.status(404).json({
          status: false,
          message: 'Doctor profile not found for this user',
          error: {
            code: 'DOCTOR_NOT_FOUND',
            issue: `No doctor profile found for userId: ${userId}`,
          },
        });
      }
  
      const doctorId = doctorProfile.userId;
  
      // 🧠 Fetch existing availabilities and their slots
      const existingAvailability = await prisma.doctorAvailability.findFirst({
        where: { doctorId, dayOfWeek },
        include: { timeSlots: true },
      });
  
      const existingSlots = existingAvailability?.timeSlots || [];
  
      // 🧠 Combine existing slots + new slots
      const allSlots = [
        ...existingSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
        ...timeSlots,
      ];
  
      // 🧠 Sort all slots by start time
      const sortedSlots = allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
      // 🧠 Check for any overlaps across all slots
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentSlotEnd = sortedSlots[i].endTime;
        const nextSlotStart = sortedSlots[i + 1].startTime;
  
        if (currentSlotEnd > nextSlotStart) {
          return res.status(400).json({
            status: false,
            message: 'Overlapping time slots detected. Please fix them before submitting.',
            error: {
              code: 'OVERLAPPING_SLOTS',
              issue: `Slot ending at ${currentSlotEnd} overlaps with slot starting at ${nextSlotStart}`,
            },
          });
        }
      }
  
      if (existingAvailability) {
        return res.status(409).json({
          status: false,
          message: `Doctor already has availability set for this day (${dayOfWeek})`,
          error: {
            code: 'DUPLICATE_AVAILABILITY',
            issue: 'Availability already set for this day of the week.',
          },
        });
      }
  
      // 🎯 Finally create if no overlaps found
      const newAvailability = await prisma.doctorAvailability.create({
        data: {
          doctorId,
          dayOfWeek,
          timeSlots: {
            create: timeSlots.map((slot: { startTime: string, endTime: string }) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
        include: {
          timeSlots: true,
        },
      });
  
      return res.status(201).json({
        status: true,
        message: 'Doctor availability set successfully',
        data: newAvailability,
      });
    } catch (error) {
      console.error('Error setting doctor availability:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while setting the doctor availability.',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

  export const updateDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated or invalid userId',
      });
    }
  
    const validation = DoctorAvailabilitySchema.safeParse(req.body);
  
    if (!validation.success) {
      return res.status(400).json({
        status: false,
        message: validation.error.errors.map(err => err.message).join(', '),
        error: {
          code: 'VALIDATION_ERROR',
          issue: validation.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }
  
    const { dayOfWeek, timeSlots } = validation.data;
  
    try {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: userId },
      });
  
      if (!doctorProfile) {
        return res.status(404).json({
          status: false,
          message: 'Doctor profile not found for this user',
          error: {
            code: 'DOCTOR_NOT_FOUND',
            issue: `No doctor profile found for userId: ${userId}`,
          },
        });
      }
  
      const doctorId = doctorProfile.userId;
  
      const existingAvailability = await prisma.doctorAvailability.findFirst({
        where: {
          doctorId,
          dayOfWeek,
        },
        include: {
          timeSlots: true,
        },
      });
  
      if (!existingAvailability) {
        return res.status(404).json({
          status: false,
          message: `No availability found for this day (${dayOfWeek})`,
          error: {
            code: 'AVAILABILITY_NOT_FOUND',
            issue: `No availability found for doctorId: ${doctorId} on day: ${dayOfWeek}`,
          },
        });
      }
  
      const existingSlots = existingAvailability?.timeSlots || [];
  
      // 🧠 Combine existing + new slots (though here we replace, but just good practice)
      const allSlots = [
        ...timeSlots,
      ];
  
      // 🧠 Sort by startTime
      const sortedSlots = allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
      // 🧠 Check for overlaps
      for (let i = 0; i < sortedSlots.length - 1; i++) {
        const currentSlotEnd = sortedSlots[i].endTime;
        const nextSlotStart = sortedSlots[i + 1].startTime;
  
        if (currentSlotEnd > nextSlotStart) {
          return res.status(400).json({
            status: false,
            message: 'Overlapping time slots detected in the update. Please fix them before submitting.',
            error: {
              code: 'OVERLAPPING_SLOTS',
              issue: `Slot ending at ${currentSlotEnd} overlaps with slot starting at ${nextSlotStart}`,
            },
          });
        }
      }
  
      // 🎯 Now safe to delete old slots and create new ones
      await prisma.timeSlot.deleteMany({
        where: {
          doctorAvailabilityId: existingAvailability.id,
        },
      });
  
      const updatedAvailability = await prisma.doctorAvailability.update({
        where: {
          id: existingAvailability.id,
        },
        data: {
          timeSlots: {
            create: timeSlots.map((slot: { startTime: string, endTime: string }) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
        include: {
          timeSlots: true,
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'Doctor availability updated successfully',
        data: updatedAvailability,
      });
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while updating the doctor availability.',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };
  

export const deleteAvailability = async (req: Request, res: Response): Promise<any> => {
    const { availabilityId } = req.params; // Get the availabilityId from URL params
    const { timeSlotId } = req.body; // Get the timeSlotId from the request body
    const doctorId = req.user?.userId; // Get the doctorId from the authenticated user
  
    if (!timeSlotId) {
      return res.status(400).json({
        status: false,
        message: "Time slot ID is required to delete a time slot",
        error: {
          code: "BAD_REQUEST",
          issue: "No timeSlotId provided in the request body",
        },
      });
    }
  
    try {
      // Step 1: Find the availability record using the availabilityId
      const availability = await prisma.doctorAvailability.findUnique({
        where: { id: availabilityId },
        include: {
          timeSlots: true, // Get associated time slots with the availability
        },
      });
  
      // If the availability record doesn't exist
      if (!availability) {
        return res.status(404).json({
          status: false,
          message: "Availability not found",
          error: {
            code: "NOT_FOUND",
            issue: "The requested availability does not exist",
          },
        });
      }
  
      // Step 2: Check if the logged-in doctor owns this availability
      if (availability.doctorId !== doctorId) {
        return res.status(403).json({
          status: false,
          message: "You are not allowed to delete this availability",
          error: {
            code: "FORBIDDEN",
            issue: "Doctor does not own this availability",
          },
        });
      }
  
      // Step 3: Check if the time slot exists and is associated with this availability
      const timeSlot = availability.timeSlots.find((slot) => slot.id === timeSlotId);
  
      if (!timeSlot) {
        return res.status(404).json({
          status: false,
          message: "Time slot not found for this availability",
          error: {
            code: "NOT_FOUND",
            issue: "The requested time slot does not exist for this availability",
          },
        });
      }
  
      // Step 4: Delete the specific time slot using the timeSlotId
      await prisma.timeSlot.delete({
        where: { id: timeSlotId },
      });
  
      // Step 5: Check if there are any remaining time slots
      const remainingTimeSlots = await prisma.timeSlot.findMany({
        where: { doctorAvailabilityId: availability.id },
      });
  
      // If no time slots are left, delete the availability record
      if (remainingTimeSlots.length === 0) {
        await prisma.doctorAvailability.delete({
          where: { id: availabilityId },
        });
        return res.status(200).json({
          status: true,
          message: "Time slot deleted and availability record removed as no time slots remain",
          data: {},
        });
      }
  
      return res.status(200).json({
        status: true,
        message: "Time slot deleted successfully",
        data: {},
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
        error: {
          code: "SERVER_ERROR",
          issue: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  };
