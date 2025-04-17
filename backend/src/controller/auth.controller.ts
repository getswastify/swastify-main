import { Request, Response } from "express";
import { prisma } from "../utils/prismaConnection";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import sendOtpEmail from "../utils/emailService";
import { redis } from "../utils/redisConnection";



export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, phone, password, firstName, lastName, dob, gender } = req.body;

    // 1. Check if user already exists (for email/phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }

    // 2. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP

    // 3. Store the OTP and user data in Redis
    const userData = {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
      role:"USER" ,
      otp
    };

    await redis.setex(`otp:${email}`, 300, JSON.stringify(userData)); // OTP expires in 5 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({ message: 'Error sending OTP. Please try again.' });
    }

    // 5. Respond with OTP sent status
    res.status(200).json({
      message: 'OTP sent to your email. Please verify.',
      otpVerificationRequired: true
    });

  } catch (err) {
    console.error('[REGISTER_USER_ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerDoctor = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, phone, password, firstName, lastName, dob, gender } = req.body;

    // 1. Check if user already exists (for email/phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }

    // 2. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP

    // 3. Store the OTP and user data in Redis
    const userData = {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
      role:"DOCTOR" ,
      otp
    };

    await redis.setex(`otp:${email}`, 300, JSON.stringify(userData)); // OTP expires in 5 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({ message: 'Error sending OTP. Please try again.' });
    }

    // 5. Respond with OTP sent status
    res.status(200).json({
      message: 'OTP sent to your email. Please verify.',
      otpVerificationRequired: true
    });

  } catch (err) {
    console.error('[REGISTER_USER_ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerHospital = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, phone, password, firstName, lastName, dob, gender } = req.body;

    // 1. Check if user already exists (for email/phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }

    // 2. Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP

    // 3. Store the OTP and user data in Redis
    const userData = {
      email,
      phone,
      password,
      firstName,
      lastName,
      dob,
      gender,
      role:"HOSPITAL" ,
      otp
    };

    await redis.setex(`otp:${email}`, 300, JSON.stringify(userData)); // OTP expires in 5 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({ message: 'Error sending OTP. Please try again.' });
    }

    // 5. Respond with OTP sent status
    res.status(200).json({
      message: 'OTP sent to your email. Please verify.',
      otpVerificationRequired: true
    });

  } catch (err) {
    console.error('[REGISTER_USER_ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOtpAndRegister = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;

    // 1. Fetch user data from Redis
    const cachedData = await redis.get(`otp:${email}`);

    if (!cachedData) {
      return res.status(400).json({ message: 'No registration data found or OTP expired. Please try registering again.' });
    }

    const cachedUser = JSON.parse(cachedData);

    // 2. Check if the OTP matches
    if (cachedUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(cachedUser.password, 10);

    // 4. Insert the user data into the database without profiles
    const user = await prisma.user.create({
      data: {
        email: cachedUser.email,
        phone: cachedUser.phone,
        password: hashedPassword,
        firstName: cachedUser.firstName,
        lastName: cachedUser.lastName,
        dob: new Date(cachedUser.dob),
        gender: cachedUser.gender,
        role: cachedUser.role
      }
    });

    // 5. Clear the Redis cache after successful registration
    await redis.del(`otp:${email}`);

    // 6. Respond with the newly created user
    res.status(201).json({
      message: 'User registered successfully',
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

