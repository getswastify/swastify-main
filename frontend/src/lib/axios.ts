import axios, { AxiosError, AxiosResponse } from "axios"

// Define response structure with proper typing
export interface ApiSuccessResponse<T = unknown> {
  status: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  status: false
  message: string
  error: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// Type for the error response data from the server
interface ErrorResponseData {
  message?: string
  [key: string]: unknown
}

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
  <T>(response: AxiosResponse<T>): AxiosResponse<T> => {
    // Optionally transform the response data here if needed
    response.data = {
      status: true,
      message: (response.data as Record<string, unknown>).message as string || "Operation successful",
      data: response.data,
    } as unknown as T;
    return response;
  },
  (error: AxiosError<ErrorResponseData>): Promise<ApiErrorResponse> => {
    // Transform error responses to match our expected format
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      "An unexpected error occurred"

    return Promise.reject({
      status: false,
      message: errorMessage,
      error: error.response?.data || error,
    })
  },
)

export default api
