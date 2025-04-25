import { prisma } from "../utils/prismaConnection";
import { Request, Response } from 'express';

export const getPatientDashboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    // Get the patient's profile
    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        bloodGroup: true,
        address: true,
        height: true,
        weight: true,
      },
    });

    const isProfileComplete = !!profile?.bloodGroup && !!profile?.address && !!profile?.height && !!profile?.weight;

    return res.status(200).json({
      status: true,
      message: 'Patient dashboard data retrieved successfully',
      data: {
        isProfileComplete,
        // You can add more dashboard-related data here later
      },
    });
  } catch (error) {
    console.error('[GET_PATIENT_DASHBOARD_ERROR]', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch patient dashboard data',
      error: {
        code: 'SERVER_ERROR',
        issue: 'Something went wrong while getting dashboard info',
      },
    });
  }
};

export const getDoctorDashboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId },
      select: {
        specialization: true,
        clinicAddress: true,
        consultationFee: true,
        status: true, // Add the status field to check verification status
      },
    });

    if (!profile) {
      return res.status(404).json({
        status: false,
        message: 'Doctor profile not found',
        error: {
          code: 'PROFILE_NOT_FOUND',
          issue: 'No doctor profile exists for this user',
        },
      });
    }

    const isProfileComplete =
      !!profile.specialization && !!profile.clinicAddress && !!profile.consultationFee;

    const isVerified = profile.status || null; // Set isVerified based on the profile's status field

    return res.status(200).json({
      status: true,
      message: 'Doctor dashboard data retrieved successfully',
      data: {
        isProfileComplete,
        isVerified,  // Include isVerified in the response
      },
    });
  } catch (error) {
    console.error('[GET_DOCTOR_DASHBOARD_ERROR]', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch doctor dashboard data',
      error: {
        code: 'SERVER_ERROR',
        issue: 'Something went wrong while getting dashboard info',
      },
    });
  }
};

export const getHospitalDashboard = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    const profile = await prisma.hospitalProfile.findUnique({
      where: { userId },
      select: {
        hospitalName: true,
        location: true,
        services: true,
        status: true,  // Add the status field here to determine isVerified
      },
    });

    if (!profile) {
      return res.status(404).json({
        status: false,
        message: 'Hospital profile not found',
        error: {
          code: 'PROFILE_NOT_FOUND',
          issue: 'No hospital profile exists for this user',
        },
      });
    }

    const isProfileComplete =
      !!profile.hospitalName && !!profile.location && !!profile.services;

    const isVerified = profile.status || null; // Set isVerified based on the profile's status field

    return res.status(200).json({
      status: true,
      message: 'Hospital dashboard data retrieved successfully',
      data: {
        isProfileComplete,
        isVerified,  // Include isVerified in the response
      },
    });
  } catch (error) {
    console.error('[GET_HOSPITAL_DASHBOARD_ERROR]', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch hospital dashboard data',
      error: {
        code: 'SERVER_ERROR',
        issue: 'Something went wrong while getting dashboard info',
      },
    });
  }
};