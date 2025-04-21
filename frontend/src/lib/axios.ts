import axios from "axios"

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This ensures cookies are sent with requests
  timeout: 10000, // 10 seconds
})

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        // Also add token to a custom header for middleware to check
        config.headers["x-auth-token"] = token
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
    // If we get a 401 Unauthorized error, clear the auth token
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
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
