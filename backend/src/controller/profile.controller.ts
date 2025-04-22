import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';
import { DoctorProfileSchema, HospitalProfileSchema } from '../zodSchemas/profileSchema';


export const createDoctorProfile = async (req: Request, res: Response): Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    const validation = DoctorProfileSchema.safeParse(req.body);
  
    if (!validation.success) {
        return res.status(400).json({
          status: false,
          message: validation.error.errors.map(err => err.message).join(', '), // 👈 Main fix here
          error: {
            code: 'VALIDATION_ERROR',
            issue: validation.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      
  
    const {
      specialization,
      clinicAddress,
      consultationFee,
      availableFrom,
      availableTo,
    } = validation.data;
  
    try {
      const doctorProfile = await prisma.doctorProfile.create({
        data: {
          userId,
          specialization,
          clinicAddress,
          consultationFee,
          availableFrom,
          availableTo,
          status: 'PENDING',
        },
      });
  
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
  
    const validation = HospitalProfileSchema.safeParse(req.body);
  
    if (!validation.success) {
        return res.status(400).json({
          status: false,
          message: validation.error.errors.map(err => err.message).join(', '), // 👈 Main fix here
          error: {
            code: 'VALIDATION_ERROR',
            issue: validation.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      
  
    const { hospitalName, location, services } = validation.data;
  
    try {
      const hospitalProfile = await prisma.hospitalProfile.create({
        data: {
          userId,
          hospitalName,
          location,
          services,
          status: 'PENDING',
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

