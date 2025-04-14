import { prisma } from '../prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, ApprovalStatus } from '@prisma/client';

const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const registerPatient = async (body: any) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
    } = body;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        role: UserRole.USER,
        patientProfile: {
          create: {},
        },
      },
    });

    return { status: 201, data: { user } };
  } catch (err) {
    return { status: 500, data: { error: 'Something went wrong' } };
  }
};

export const registerDoctor = async (body: any) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
      specialization,
      clinicAddress,
      availableFrom,
      availableTo,
      consultationFee,
    } = body;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        role: UserRole.DOCTOR,
        doctorProfile: {
          create: {
            specialization,
            clinicAddress,
            availableFrom: new Date(availableFrom),
            availableTo: new Date(availableTo),
            consultationFee: parseFloat(consultationFee),
            status: ApprovalStatus.PENDING,
          },
        },
      },
    });

    return { status: 201, data: { user } };
  } catch (err) {
    return { status: 500, data: { error: 'Something went wrong' } };
  }
};

export const registerHospital = async (body: any) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
      hospitalName,
      location,
      services,
    } = body;

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        role: UserRole.HOSPITAL,
        hospitalProfile: {
          create: {
            hospitalName,
            location,
            services,
            status: ApprovalStatus.PENDING,
          },
        },
      },
    });

    return { status: 201, data: { user } };
  } catch (err) {
    return { status: 500, data: { error: 'Something went wrong' } };
  }
};
