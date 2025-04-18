import { Request, Response } from "express";
import { prisma } from "../utils/prismaConnection";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { redis } from "../utils/redisConnection";
import jwt from "jsonwebtoken";
import {sendOtpEmail, sendResetPassEmail} from "../utils/emailConnection";
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

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

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, phone, password } = req.body;

    // 1. Check if the user exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string, // Ensure you have a secret in your env variables
      { expiresIn: "1h" } // Token expiration time
    );

    // 4. Send response with the token
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("[LOGIN_USER_ERROR]", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const requestPasswordReset = async (req: Request, res:Response ): Promise<any>=> {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate JWT token
    const token = jwt.sign(
      { email, purpose: 'reset_password' },
      process.env.JWT_SECRET || '',
      { expiresIn: 10 * 60 } //10 minutes
    );

    // Store token in Redis
    await redis.set(`reset:${email}`, token, 'EX', 10 * 60);

    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    await sendResetPassEmail(email, resetLink);

    res.status(200).json({ message: 'Reset password email sent ✅', token });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Something went wrong 🥲' });
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<any> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Invalid token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { email: string, purpose: string };
    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({ message: 'Invalid purpose' });
    }

    // Check Redis
    const storedToken = await redis.get(`reset:${decoded.email}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ message: 'Token expired or invalid' });
    }

    // ✅ Token is valid
    res.status(200).json({ message: 'Token valid', email: decoded.email });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { email: string, purpose: string };
    const email = decoded.email;

    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    // 2. Check if token exists in Redis
    const redisToken = await redis.get(`reset:${email}`);
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in DB
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 5. Invalidate token
    await redis.del(`reset:${email}`);

    res.status(200).json({ message: 'Password has been reset successfully 🙌' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};