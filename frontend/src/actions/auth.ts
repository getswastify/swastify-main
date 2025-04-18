"use server"

import { cookies } from "next/headers"
import axiosInstance from "@/lib/axios"
import { redirect } from "next/navigation"
import type { AxiosError } from "axios"

// Types for our auth actions
interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  dob: string
  gender: string
}

interface PasswordResetRequestData {
  email: string
}

interface PasswordResetData {
  token: string
  newPassword: string
}

interface VerifyOTPData {
  email: string
  otp: string
}

interface ResendOTPData {
  email: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  valid?: boolean
}

// Token expiration time (in seconds)
const TOKEN_EXPIRY = 60 * 60 * 24 * 7 // 7 days

/**
 * Login action
 */
export async function login(data: LoginData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/login", data)

    // Set the auth token in a secure HTTP-only cookie
    const token = response.data.token
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: TOKEN_EXPIRY,
      })
    } else {
      console.error("No token received from login response")
      return { success: false, error: "Authentication failed: No token received" }
    }

    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Login failed",
    }
  }
}

/**
 * Register action
 */
export async function register(data: RegisterData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/register", data)
    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Registration failed",
    }
  }
}

/**
 * Verify OTP action
 */
export async function verifyOTP(data: VerifyOTPData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", data)
    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "OTP verification failed",
    }
  }
}

/**
 * Resend OTP action
 */
export async function resendOTP(data: ResendOTPData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/resend-otp", data)
    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Failed to resend OTP",
    }
  }
}

/**
 * Request password reset action
 */
export async function requestPasswordReset(data: PasswordResetRequestData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/request-password-reset", data)
    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Failed to send reset email",
    }
  }
}

/**
 * Verify reset token action
 */
export async function verifyResetToken(token: string): Promise<ApiResponse> {
  try {
    console.log("token sikkitu " + token);
    
    const response = await axiosInstance.get(`/auth/verify-reset-token?token=${token}`)
    
    return { success: true, valid: response.data.valid }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Invalid or expired token",
    }
  }
}

/**
 * Reset password action
 */
export async function resetPassword(data: PasswordResetData): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post("/auth/reset-password", data)
    return { success: true, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>
    return {
      success: false,
      error: axiosError.response?.data?.message || "Failed to reset password",
    }
  }
}

/**
 * Logout action
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint if your API has one
    await axiosInstance.post("/auth/logout")
  } catch (error) {
    // Continue with logout even if API call fails
    console.error("Logout API call failed:", error)
  }

  // Clear the auth cookie
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  // Redirect to login page
  redirect("/login")
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    console.log("No auth token found in cookies")
    return false
  }

  try {
    console.log("Verifying token with API")
    const response = await axiosInstance.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const isValid = response.status === 200
    console.log(`Token verification result: ${isValid}`)
    return isValid
  } catch (error) {
    console.error("Token verification failed:", error)
    return false
  }
}
