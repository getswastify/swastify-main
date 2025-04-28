import { calculateExperience } from "../helper/CalculateExperience";
import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';


export const getApprovedDoctors = async (_req: Request, res: Response):Promise<any> => {
    try {
      const approvedDoctors = await prisma.doctorProfile.findMany({
        where: {
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName:true
            },
          },
        },
      });
  
      

      return res.status(200).json({
        status: true,
        message: 'Approved doctors fetched successfully',
        data: approvedDoctors.map((doctor) => ({
          doctorId: doctor.userId,
          fullName: {
            firstName:doctor.user.firstName,
            lastName:doctor.user.lastName
          },
          specialization: doctor.specialization,
          experience: calculateExperience(doctor.startedPracticeOn.toISOString()),
          consultationFee: doctor.consultationFee,
        })),
      });
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while fetching doctors.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

export const getPublicDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
    const { doctorId } = req.params;  // Get doctorId from the URL params
    
    try {
      // Step 1: Fetch the doctor's profile and availability details
      const doctorAvailability = await prisma.doctorAvailability.findMany({
        where: {
          doctorId: doctorId, // Filter by doctorId
        },
        include: {
          timeSlots: true,  // Include the time slots for the doctor
        },
      });
  
      if (doctorAvailability.length === 0) {
        return res.status(404).json({
          status: false,
          message: `No availability found for doctorId: ${doctorId}`,
          error: {
            code: 'NO_AVAILABILITY',
            issue: `This doctor doesn't have any available time slots set.`,
          },
        });
      }
  
      // Step 2: Format response to include the doctor details + available time slots
      const availabilityResponse = doctorAvailability.map((availability) => ({
        dayOfWeek: availability.dayOfWeek,  // The day of the week
        timeSlots: availability.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      }));
  
      return res.status(200).json({
        status: true,
        message: 'Doctor availability fetched successfully',
        data: availabilityResponse,
      });
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while fetching doctor availability.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
