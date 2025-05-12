import axios from "axios"
import { getCookie } from "./cookies"

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // This ensures cookies are sent with requests
  timeout: 15000, // 15 seconds
})

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const token = getCookie("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add user role to headers if available
      const userRole = getCookie("user_role")
      if (userRole) {
        config.headers["x-user-role"] = userRole
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to standardize error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized error, redirect to login page
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // The cookies will be cleared by the server
        window.location.href = "/login"
      }
    }

    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
    const errorCode = error.response?.data?.error?.code || "UNKNOWN_ERROR"
    const errorIssue = error.response?.data?.error?.issue || errorMessage

    return Promise.reject({
      status: false,
      message: errorMessage,
      error: {
        code: errorCode,
        issue: errorIssue,
      },
    })
  },
)

export default api
