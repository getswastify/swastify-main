import axios from "axios"

// Create a base axios instance with common configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
})

// Add a request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token from localStorage or cookies here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors here
    return Promise.reject(error)
  },
)

export default axiosInstance
