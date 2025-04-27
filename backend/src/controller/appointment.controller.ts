import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';
import { DoctorAvailabilitySchema } from "../zodSchemas/AppointmentSchema";

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
  
      // Step 2: Get the doctor's availability
      const availability = await prisma.doctorAvailability.findMany({
        where: {
          doctorId,
        },
        orderBy: {
          dayOfWeek: 'asc', // Ordering by day of the week to keep the days in the correct order (Sunday to Saturday)
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
  const userId = req.user?.userId; // The userId from the authenticated user

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

  const { dayOfWeek, startTime, endTime } = validation.data;

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

    // Step 2: Check if the doctor already has availability set for this day
    const existingAvailability = await prisma.doctorAvailability.findFirst({
      where: { doctorId, dayOfWeek },
    });

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

    // Step 3: Create the new doctor availability
    const newAvailability = await prisma.doctorAvailability.create({
      data: {
        doctorId,  // Use the doctorId from the DoctorProfile
        dayOfWeek,
        startTime,
        endTime,
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
    const userId = req.user?.userId; // The userId from the authenticated user
  
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
  
    const { dayOfWeek, startTime, endTime } = validation.data;
  
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
  
      // Step 2: Find the existing availability by doctorId and dayOfWeek
      const existingAvailability = await prisma.doctorAvailability.findFirst({
        where: {
          doctorId,
          dayOfWeek,
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
  
      // Step 3: Update the existing availability
      const updatedAvailability = await prisma.doctorAvailability.update({
        where: {
          id: existingAvailability.id,  // Match by the availability record ID
        },
        data: {
          startTime,  // Update start time
          endTime,    // Update end time
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

export const deleteAvailability = async (req:Request, res:Response):Promise<any> => {
    const { availabilityId } = req.params;
    const doctorId = req.user?.userId; // Assuming you set req.user in auth middleware
  
    try {
      const availability = await prisma.doctorAvailability.findUnique({
        where: { id: availabilityId },
      });
  
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
  
      await prisma.doctorAvailability.delete({
        where: { id: availabilityId },
      });
  
      return res.status(200).json({
        status: true,
        message: "Availability deleted successfully",
        data: {},
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "Something went wrong",
        error: {
          code: "SERVER_ERROR",
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };