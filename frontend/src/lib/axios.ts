import axios, { type AxiosResponse, type AxiosError } from "axios"

// Define response structure
export interface ApiSuccessResponse<T = any> {
  status: true
  message: string
  data: T
}

export interface ApiErrorResponse {
  status: false
  message: string
  error: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

// Add a response interceptor to standardize response format
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Optionally, you can transform the response data here if needed
    response.data = {
      status: true,
      message: response.data.message || "Operation successful",
      data: response.data,
    };
    return response;
  },
  (error: AxiosError): Promise<ApiErrorResponse> => {
    // Transform error responses to match our expected format
    const errorMessage = (error.response?.data as { message?: string })?.message || error.message || "An unexpected error occurred"

    return Promise.reject({
      status: false,
      message: errorMessage,
      error: error.response?.data || error,
    })
  },
)

export default api
