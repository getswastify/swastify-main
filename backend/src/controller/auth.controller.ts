import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import sendOtpEmail from "../utils/emailService";

// Temporary in-memory cache for OTPs
const otpCache: { [key: string]: string } = {};

const prisma = new PrismaClient();

export const registerPatient = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, phone, password, firstName, lastName, dob, gender } = req.body;

    // 1. Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }

    // 2. Generate OTP and send email
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    try {
      await sendOtpEmail(email, otp); // Send OTP to user's email
      // Temporarily store the OTP in memory cache or a DB
      otpCache[email] = otp;  // Store OTP in memory (Or use a persistent store like Redis)
    } catch (error) {
      return res.status(500).json({ message: 'Error sending OTP. Please try again.' });
    }

    // 3. Respond with OTP sent status
    res.status(200).json({
      message: 'OTP sent to your email. Please verify.',
      otpVerificationRequired: true
    });
    
  } catch (err) {
    console.error('[REGISTER_PATIENT_ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtpAndRegister = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp, password, firstName, lastName, dob, gender, phone } = req.body;

    // 1. Validate OTP
    if (otpCache[email] !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        dob: new Date(dob),
        gender,
        role: 'USER',  // Default role for patient
        patientProfile: {
          create: {}  // Create an empty profile for now
        }
      },
      include: {
        patientProfile: true
      }
    });

    // 4. Clear the OTP cache (after successful registration)
    delete otpCache[email];

    // 5. Respond with success
    res.status(201).json({
      message: 'Patient registered successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[VERIFY_OTP_ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
