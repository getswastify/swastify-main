import api from "@/lib/axios"
import type {
  ApiResponse,
  LoginData,
  RegisterData,
  ResetPasswordData,
  LoginApiResponse,
  RegisterResponse,
  VerifyOtpApiResponse,
  User,
} from "@/types/auth"

/**
 * Login user
 */
export const loginUser = async (data: LoginData): Promise<LoginApiResponse> => {
  try {
    const response = await api.post<LoginApiResponse>("/auth/login", data)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Register user
 */
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/auth/register", data)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Register Doctor
 */
export const registerDoctor = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/auth/register/doctor", data)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Register Hospital
 */
export const registerHospital = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/auth/register/hospital", data)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<VerifyOtpApiResponse> => {
  try {
    const response = await api.post<VerifyOtpApiResponse>("/auth/verify-otp", { email, otp })
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Resend OTP
 */
export const resendOTP = async (email: string): Promise<ApiResponse<{ sent: boolean }>> => {
  try {
    const response = await api.post<ApiResponse<{ sent: boolean }>>("/auth/resend-otp", { email })
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<ApiResponse<{ sent: boolean }>> => {
  try {
    const response = await api.post<ApiResponse<{ sent: boolean }>>("/auth/request-password-reset", { email })
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Verify reset token
 */
export const verifyResetToken = async (token: string): Promise<ApiResponse<{ valid: boolean }>> => {
  try {
    const response = await api.get<ApiResponse<{ valid: boolean }>>(`/auth/verify-reset-token?token=${token}`)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Reset password
 */
export const resetPassword = async (data: ResetPasswordData): Promise<ApiResponse<{ updated: boolean }>> => {
  try {
    const response = await api.post<ApiResponse<{ updated: boolean }>>("/auth/reset-password", data)
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get<ApiResponse<User>>("/auth/getuser-details")
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}

/**
 * Logout user
 */
export const logoutUser = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post<ApiResponse<void>>("/auth/logout")
    return response.data
  } catch (error) {
    return error as ApiResponse<never>
  }
}
