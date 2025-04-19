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

    // Store token in localStorage for client-side access
    if (response.data.status && response.data.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.data.token)
      }
    }

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
 * Verify OTP
 */
export const verifyOTP = async (email: string, otp: string): Promise<VerifyOtpApiResponse> => {
  try {
    const response = await api.post<VerifyOtpApiResponse>("/auth/verify-otp", { email, otp })

    // If verification is successful and we get a token, store it
    if (response.data.status && response.data.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.data.token)
      }
    }

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
    // Only make this call if we have a token
    if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
      return {
        status: false,
        message: "No authentication token found",
      }
    }

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

    // Remove token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }

    return response.data
  } catch (error) {
    // Even if the API call fails, clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }

    return error as ApiResponse<never>
  }
}
