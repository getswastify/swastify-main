import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';
import { DoctorProfileSchema, HospitalProfileSchema, PatientProfileSchema, UpdateDoctorProfileSchema, UpdateHospitalProfileSchema, UpdatePatientProfileSchema} from '../zodSchemas/profileSchema';

export const createPatientProfile = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user?.userId;

  if (!userId || typeof userId !== "string") {
    return res.status(401).json({
      status: false,
      message: "User not authenticated",
    });
  }

  const validation = PatientProfileSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      status: false,
      message: validation.error.errors.map(err => err.message).join(", "),
      error: {
        code: "VALIDATION_ERROR",
        issue: validation.error.errors.map(err => ({
          path: err.path.join("."),
          message: err.message,
        })),
      },
    });
  }

  const { bloodGroup, address, height, weight, allergies, diseases } = validation.data;

  try {
    const existingProfile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(409).json({
        status: false,
        message: "Patient profile already exists",
        error: {
          code: "DUPLICATE_PROFILE",
          issue: "A profile for this user already exists",
        },
      });
    }

    const newProfile = await prisma.patientProfile.create({
      data: {
        userId,
        bloodGroup,
        address,
        height,
        weight,
        allergies: allergies || [],  // Store as array, default to empty if undefined
        diseases: diseases || [],    // Store as array, default to empty if undefined
      },
    });
    
    

    return res.status(201).json({
      status: true,
      message: "Patient profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error("Error creating patient profile:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while creating the patient profile.",
      error: {
        code: "SERVER_ERROR",
        issue: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
};

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

export const updatePatientProfile = async (req: Request, res: Response):Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    const validation = UpdatePatientProfileSchema.safeParse(req.body);
  
    if (!validation.success) {
      return res.status(400).json({
        status: false,
        message: validation.error.errors.map(e => e.message).join(', '),
        error: {
          code: 'VALIDATION_ERROR',
          issue: validation.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
      });
    }
  
    const { bloodGroup, address, height, weight, allergies, diseases } = validation.data;
  
    try {
      const updatedProfile = await prisma.patientProfile.update({
        where: { userId },
        data: {
          ...(bloodGroup && { bloodGroup }),
          ...(address && { address }),
          ...(height && { height }),
          ...(weight && { weight }),
          ...(allergies && { allergies }),
          ...(diseases && { diseases }),
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'Patient profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      console.error('Error updating patient profile:', error);

      if (error instanceof Error && (error as any).code === 'P2025') {
        return res.status(404).json({
          status: false,
          message: 'Patient profile not found',
        });
      }

      return res.status(500).json({
        status: false,
        message: 'Failed to update patient profile',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

export const updateDoctorProfile = async (req: Request, res: Response):Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    const validation = UpdateDoctorProfileSchema.safeParse(req.body);
  
    if (!validation.success) {
      return res.status(400).json({
        status: false,
        message: validation.error.errors.map((err) => err.message).join(', '),
        error: {
          code: 'VALIDATION_ERROR',
          issue: validation.error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }
  
    const { specialization, clinicAddress, consultationFee, availableFrom, availableTo } = validation.data;
  
    try {
      const updatedDoctorProfile = await prisma.doctorProfile.update({
        where: { userId },
        data: {
          ...(specialization && { specialization }),
          ...(clinicAddress && { clinicAddress }),
          ...(consultationFee && { consultationFee }),
          ...(availableFrom && { availableFrom }),
          ...(availableTo && { availableTo }),
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'Doctor profile updated successfully',
        data: updatedDoctorProfile,
      });
    } catch (error) {
      console.error('Error updating doctor profile:', error);


      if (error instanceof Error && (error as any).code === 'P2025') {
        return res.status(404).json({
          status: false,
          message: 'Doctor profile not found',
        });
      }

      return res.status(500).json({
        status: false,
        message: 'Failed to update doctor profile',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };

export const updateHospitalProfile = async (req: Request, res: Response):Promise<any> => {
    const userId = req.user?.userId;
  
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({
        status: false,
        message: 'User not authenticated',
      });
    }
  
    const validation = UpdateHospitalProfileSchema.safeParse(req.body);
  
    if (!validation.success) {
      return res.status(400).json({
        status: false,
        message: validation.error.errors.map((err) => err.message).join(', '),
        error: {
          code: 'VALIDATION_ERROR',
          issue: validation.error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
    }
  
    const { hospitalName, location, services } = validation.data;
  
    try {
      const updatedHospitalProfile = await prisma.hospitalProfile.update({
        where: { userId },
        data: {
          ...(hospitalName && { hospitalName }),
          ...(location && { location }),
          ...(services && { services }),
        },
      });
  
      return res.status(200).json({
        status: true,
        message: 'Hospital profile updated successfully',
        data: updatedHospitalProfile,
      });
    } catch (error) {
      console.error('Error updating hospital profile:', error);

      if (error instanceof Error && (error as any).code === 'P2025') {
        return res.status(404).json({
          status: false,
          message: 'Hospital profile not found',
        });
      }

      return res.status(500).json({
        status: false,
        message: 'Failed to update hospital profile',
        error: {
          code: 'SERVER_ERROR',
          issue: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };