import api, { type ApiResponse } from "@/lib/axios"

// Types for request data
export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  dob: string
  gender: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

// Types for response data
export interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  // Add other user fields as needed
}

export interface TokenData {
  token: string
  // Add other token-related fields as needed
}

export interface VerificationData {
  valid: boolean
  // Add other verification-related fields as needed
}

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<ApiResponse<UserData & TokenData>> => {
  try {
    const response = await api.post<UserData & TokenData>("/auth/login", data)
    return {
      status: true,
      message: "Login successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Register user
 */
export const registerUser = async (data: RegisterData): Promise<ApiResponse<UserData>> => {
  try {
    const response = await api.post<UserData>("/auth/register", data)
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> => {
  try {
    const response = await api.post<{ verified: boolean }>("/auth/verify-otp", { email, otp })
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Resend OTP
 */
export const resendOTP = async (email: string): Promise<ApiResponse<{ sent: boolean }>> => {
  try {
    const response = await api.post<{ sent: boolean }>("/auth/resend-otp", { email })
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<ApiResponse<{ sent: boolean }>> => {
  try {
    const response = await api.post<{ sent: boolean }>("/auth/request-password-reset", { email })
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Verify reset token
 */
export const verifyResetToken = async (token: string): Promise<ApiResponse<VerificationData>> => {
  try {
    const response = await api.get<VerificationData>(`/auth/verify-reset-token?token=${token}`)
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Reset password
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse<{ updated: boolean }>> => {
  try {
    const response = await api.post<{ updated: boolean }>("/auth/reset-password", data)
    return {
      status: true,
      message: "Registration successful",
      data: response.data
    }
  } catch (error) {
    return error as ApiResponse<never>
  }
}
