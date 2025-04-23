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
      return res.status(400).json({
        status: false,
        message: "Email or phone already registered. Please use a different one.",
        error: {
          code: "ERR_ALREADY_REGISTERED",
          issue: "Email or phone already exists"
        }
      });
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
      role: "USER",
      otp
    };

    await redis.setex(`otp:${email}`, 600, JSON.stringify(userData)); // OTP expires in 10 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "There was an issue sending the OTP. Please try again later.",
        error: {
          code: "ERR_EMAIL_FAILURE",
          issue: "Failed to send OTP email"
        }
      });
    }

    // 5. Respond with OTP sent status
    return res.status(200).json({
      status: true,
      message: "OTP sent to your email. Please verify to complete the registration.",
      data: {
        otpVerificationRequired: true
      }
    });

  } catch (err) {
    console.error('[REGISTER_USER_ERROR]', err);
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: {
        code: "ERR_INTERNAL",
        issue: "Unexpected error occurred"
      }
    });
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
      return res.status(400).json({
        status: false,
        message: 'Email or phone already registered. Please use a different one.',
        error: {
          code: 'ERR_ALREADY_REGISTERED',
          issue: 'Email or phone already exists'
        }
      });
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
      role: 'DOCTOR',
      otp
    };

    await redis.setex(`otp:${email}`, 300, JSON.stringify(userData)); // OTP expires in 5 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'There was an issue sending the OTP. Please try again later.',
        error: {
          code: 'ERR_EMAIL_FAILURE',
          issue: 'Failed to send OTP email'
        }
      });
    }

    // 5. Respond with OTP sent status
    return res.status(200).json({
      status: true,
      message: 'OTP sent to your email. Please verify to complete your registration.',
      data: {
        otpVerificationRequired: true
      }
    });

  } catch (err) {
    console.error('[REGISTER_DOCTOR_ERROR]', err);
    return res.status(500).json({
      status: false,
      message: 'Server error. Please try again later.',
      error: {
        code: 'ERR_INTERNAL',
        issue: 'Unexpected error occurred'
      }
    });
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
      return res.status(400).json({
        status: false,
        message: 'Email or phone already registered. Please use a different one.',
        error: {
          code: 'ERR_ALREADY_REGISTERED',
          issue: 'Email or phone already exists'
        }
      });
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
      role: 'HOSPITAL',
      otp
    };

    await redis.setex(`otp:${email}`, 300, JSON.stringify(userData)); // OTP expires in 5 minutes

    // 4. Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'There was an issue sending the OTP. Please try again later.',
        error: {
          code: 'ERR_EMAIL_FAILURE',
          issue: 'Failed to send OTP email'
        }
      });
    }

    // 5. Respond with OTP sent status
    return res.status(200).json({
      status: true,
      message: 'OTP sent to your email. Please verify to complete your registration.',
      data: {
        otpVerificationRequired: true
      }
    });

  } catch (err) {
    console.error('[REGISTER_HOSPITAL_ERROR]', err);
    return res.status(500).json({
      status: false,
      message: 'Server error. Please try again later.',
      error: {
        code: 'ERR_INTERNAL',
        issue: 'Unexpected error occurred'
      }
    });
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required to resend OTP.",
        error: {
          code: "ERR_EMAIL_REQUIRED",
          issue: "Missing email in request body"
        }
      });
    }

    const redisKey = `otp:${email}`;
    const userDataRaw = await redis.get(redisKey);

    if (!userDataRaw) {
      return res.status(404).json({
        status: false,
        message: "No pending registration found for this email.",
        error: {
          code: "ERR_NO_PENDING_REGISTRATION",
          issue: "No OTP session exists in Redis for this email"
        }
      });
    }

    const userData = JSON.parse(userDataRaw);
    const lastSentAt = userData.lastSentAt || 0;
    const now = Date.now();

    const secondsSinceLastSent = Math.floor((now - lastSentAt) / 1000);
    const cooldownSeconds = 30;

    if (secondsSinceLastSent < cooldownSeconds) {
      return res.status(429).json({
        status: false,
        message: `Please wait ${cooldownSeconds - secondsSinceLastSent} seconds before resending OTP.`,
        error: {
          code: "ERR_COOLDOWN_ACTIVE",
          issue: "Resend attempted before cooldown expired"
        }
      });
    }

    // Generate new OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    userData.otp = newOtp;
    userData.lastSentAt = now;

    // Update Redis with new OTP and reset expiry to 10 minutes
    await redis.setex(redisKey, 600, JSON.stringify(userData));

    // Send OTP again
    try {
      await sendOtpEmail(email, newOtp);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to resend OTP. Try again later.",
        error: {
          code: "ERR_EMAIL_FAILURE",
          issue: "Could not send OTP email"
        }
      });
    }

    return res.status(200).json({
      status: true,
      message: "OTP resent successfully. Please check your email.",
      data: {
        otpResent: true
      }
    });

  } catch (err) {
    console.error('[RESEND_OTP_ERROR]', err);
    return res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: {
        code: "ERR_INTERNAL",
        issue: "Unexpected error occurred"
      }
    });
  }
};

export const verifyOtpAndRegister = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;

    // 1. Fetch user data from Redis
    const cachedData = await redis.get(`otp:${email}`);

    if (!cachedData) {
      return res.status(400).json({
        status: false,
        message: 'No registration data found or OTP expired. Please try registering again.',
        error: {
          code: 'ERR_OTP_EXPIRED',
          issue: 'OTP expired or registration data not found'
        }
      });
    }

    const cachedUser = JSON.parse(cachedData);

    // 2. Check if the OTP matches
    if (cachedUser.otp !== otp) {
      return res.status(400).json({
        status: false,
        message: 'Invalid OTP.',
        error: {
          code: 'ERR_INVALID_OTP',
          issue: 'The OTP provided does not match'
        }
      });
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
      status: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });

  } catch (err) {
    console.error('[VERIFY_OTP_ERROR]', err);
    res.status(500).json({
      status: false,
      message: 'Server error. Please try again later.',
      error: {
        code: 'ERR_INTERNAL',
        issue: 'Unexpected error occurred'
      }
    });
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
      return res.status(404).json({
        status: false,
        message: "User not found.",
        error: {
          code: "ERR_USER_NOT_FOUND",
          issue: "No user found with the provided email or phone"
        }
      });
    }

    // 2. Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials.",
        error: {
          code: "ERR_INVALID_CREDENTIALS",
          issue: "The provided password is incorrect"
        }
      });
    }

    // 3. Create a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" } // Extending token lifetime for cookies
    );



    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const, // Use 'none' in production, 'lax' in development
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    }

    // Only add domain in production
    if (process.env.NODE_ENV === "production") {
      Object.assign(cookieOptions, { domain: ".swastify.life" })
    }

    res.cookie("auth_token", token, cookieOptions)


    // 5. Send response (without the token in the body)
    res.status(200).json({
      status: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error("[LOGIN_USER_ERROR]", err);
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: {
        code: "ERR_INTERNAL",
        issue: "Unexpected error occurred"
      }
    });
  }
};

export const logoutUser = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Clear the auth cookie with conditional domain
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
      path: '/',
    };

    // Only add domain in production
    if (process.env.NODE_ENV === 'production') {
      Object.assign(cookieOptions, { domain: '.swastify.life' });
    }

    res.clearCookie('auth_token', cookieOptions);

    res.status(200).json({
      status: true,
      message: "Logout successful."
    });
  } catch (err) {
    console.error("[LOGOUT_USER_ERROR]", err);
    res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
      error: {
        code: "ERR_INTERNAL",
        issue: "Unexpected error occurred"
      }
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;

  if (!email) return res.status(400).json({
    status: false,
    message: 'Email is required',
    error: {
      code: 'ERR_MISSING_EMAIL',
      issue: 'Email is a required field to request a password reset'
    }
  });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({
      status: false,
      message: 'User not found',
      error: {
        code: 'ERR_USER_NOT_FOUND',
        issue: 'No user found with the provided email address'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { email, purpose: 'reset_password' },
      process.env.JWT_SECRET || '',
      { expiresIn: 10 * 60 } // 10 minutes
    );

    // Store token in Redis
    await redis.set(`reset:${email}`, token, 'EX', 10 * 60);

    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    await sendResetPassEmail(email, resetLink);

    res.status(200).json({
      status: true,
      message: 'Reset password email sent',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: false,
      message: 'Something went wrong 🥲',
      error: {
        code: 'ERR_INTERNAL',
        issue: 'An unexpected error occurred during the password reset process'
      }
    });
  }
};

export const verifyTokenFromHeader = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: false,
        message: "Authorization header missing or malformed.",
        error: {
          code: "ERR_NO_AUTH_HEADER",
          issue: "Expected format: 'Authorization: Bearer <token>'"
        }
      });
      return; // Return without a value
    }

    const token = authHeader.split(' ')[1]; // Extract token

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };

    res.status(200).json({
      status: true,
      message: "Token is valid.",
      data: {
        user: decoded,
      },
    });
    // No return statement here
  } catch (err) {
    console.error("[VERIFY_AUTH_ERROR]", err);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token.",
      error: {
        code: "ERR_INVALID_TOKEN",
        issue: "JWT verification failed"
      }
    });
    // No return statement here
  }
};

export const verifyResetToken = async (req: Request, res: Response): Promise<any> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      status: false,
      message: 'Invalid token',
      error: {
        code: 'ERR_INVALID_TOKEN',
        issue: 'The provided token is either missing or invalid'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { email: string, purpose: string };
    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({
        status: false,
        message: 'Invalid purpose',
        error: {
          code: 'ERR_INVALID_PURPOSE',
          issue: 'The token purpose is not for password reset'
        }
      });
    }

    // Check Redis
    const storedToken = await redis.get(`reset:${decoded.email}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({
        status: false,
        message: 'Token expired or invalid',
        error: {
          code: 'ERR_TOKEN_EXPIRED',
          issue: 'The token has expired or is invalid'
        }
      });
    }

    // ✅ Token is valid
    res.status(200).json({
      status: true,
      message: 'Token valid',
      email: decoded.email
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      status: false,
      message: 'Token expired or invalid',
      error: {
        code: 'ERR_TOKEN_INVALID',
        issue: 'The token is expired or invalid'
      }
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      status: false,
      message: 'Token and new password are required',
      error: {
        code: 'ERR_MISSING_PARAMETERS',
        issue: 'Both token and new password are required to reset the password'
      }
    });
  }

  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { email: string, purpose: string };
    const email = decoded.email;

    if (decoded.purpose !== 'reset_password') {
      return res.status(400).json({
        status: false,
        message: 'Invalid token purpose',
        error: {
          code: 'ERR_INVALID_TOKEN_PURPOSE',
          issue: 'The token purpose is not for password reset'
        }
      });
    }

    // 2. Check if token exists in Redis
    const redisToken = await redis.get(`reset:${email}`);
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({
        status: false,
        message: 'Token is invalid or expired',
        error: {
          code: 'ERR_TOKEN_INVALID',
          issue: 'The token is either invalid or expired'
        }
      });
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

    res.status(200).json({
      status: true,
      message: 'Password has been reset successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(401).json({
      status: false,
      message: 'Token is invalid or expired',
      error: {
        code: 'ERR_TOKEN_INVALID',
        issue: 'The token is either invalid or expired'
      }
    });
  }
};

export const getUserDetails = async (req: Request, res: Response):Promise<any> => {
  try {
    const token = req.cookies?.auth_token;
    // console.log(token);
    

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: No token found in cookies",
        error: {
          code: "ERR_NO_TOKEN",
          issue: "Missing auth_token in cookies"
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        error: {
          code: "ERR_USER_NOT_FOUND",
          issue: "Token is valid but user doesn’t exist anymore"
        }
      });
    }

    res.status(200).json({
      status: true,
      message: "User details fetched",
      data: { user }
    });

  } catch (err) {
    console.error("[GET_USER_DETAILS_ERROR]", err);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token",
      error: {
        code: "ERR_INVALID_TOKEN",
        issue: "JWT verification failed or token expired"
      }
    });
  }
};
