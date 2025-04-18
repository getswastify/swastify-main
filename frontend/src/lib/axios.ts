import axios from "axios"

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: "https://api.swastify.life",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

// Add a response interceptor to standardize response format
api.interceptors.response.use(
  (response) => {
    // Transform successful responses to include custom properties
    response.data = {
      status: true,
      message: response.data.message || "Operation successful",
      data: response.data,
    }
    return response
  },
  (error) => {
    // Transform error responses to match our expected format
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"

    return Promise.reject({
      status: false,
      message: errorMessage,
      error: error.response?.data || error,
    })
  },
)

export default api
