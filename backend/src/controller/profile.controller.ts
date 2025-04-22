import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';


export const createDoctorProfile = async (req: Request, res: Response):Promise<any> => {

    console.log(req.user);
    
    const userId = req.user?.userId; 
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    try {
      // Create a new doctor profile and link it to the userId
      const doctorProfile = await prisma.doctorProfile.create({
        data: {
          userId: userId, // Link the doctor profile to the authenticated user
          specialization: req.body.specialization, // Get specialization from the request body
          clinicAddress: req.body.clinicAddress, // Get clinic address from the request body
          consultationFee: req.body.consultationFee, // Get consultation fee from the request body
          status: 'PENDING', // Default status for a new profile
          availableFrom: req.body.availableFrom, // Get availableFrom time from the request body
          availableTo: req.body.availableTo, // Get availableTo time from the request body
        },
      });
  
      // Send success response with the created doctor profile data
      return res.status(201).json({
        status: true,
        message: 'Doctor profile created successfully',
        data: doctorProfile,
      });
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while creating the doctor profile.',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

export const createHospitalProfile = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    try {
      // Create new hospital profile and link it to the userId
      const hospitalProfile = await prisma.hospitalProfile.create({
        data: {
          userId: userId,
          hospitalName: req.body.hospitalName,
          location: req.body.location,
          services: req.body.services,
          status: 'PENDING', // Default status
        },
      });
  
      return res.status(201).json({
        status: true,
        message: 'Hospital profile created successfully',
        data: hospitalProfile,
      });
    } catch (error) {
      console.error('Error creating hospital profile:', error);
      return res.status(500).json({
        status: false,
        message: 'Something went wrong while creating the hospital profile.',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

