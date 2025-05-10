import api from "@/lib/axios"

// Types for appointment API responses
export interface Doctor {
  id: string
  name: string
  specialty: string
  experience: number
}

export interface DoctorsResponse {
  doctors: Doctor[]
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface AvailableSlotsResponse {
  availableSlots: TimeSlot[]
}

export interface AvailableDatesResponse {
  availableDates: string[]
}

export interface Appointment {
  appointmentId: string
  appointmentTime: string
  status: string
  doctorName: string
  doctorEmail: string
  doctorSpecialization: string
}

export interface AppointmentsResponse {
  appointments: Appointment[]
}

export interface BookAppointmentRequest {
  patientId: string
  doctorId: string
  appointmentTime: string
}

export interface BookAppointmentResponse {
  message: string
  appointment: {
    id: string
    patientId: string
    doctorId: string
    appointmentTime: string
    status: string
    createdAt: string
    updatedAt: string
    paymentStatus: string | null
    patient: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    doctor: {
      user: {
        firstName: string
        lastName: string
        email: string
      }
      specialization: string
    }
  }
}

// Doctor appointment interfaces
export interface DoctorAppointment {
  appointmentId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentTime: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  doctorName: string
  doctorSpecialization: string
  doctorEmail: string
  createdAt: string
  updatedAt: string
}

export interface DoctorAppointmentsResponse {
  status: boolean
  message: string
  data?: {
    appointments: DoctorAppointment[]
  }
  error?: string
}

export interface UpdateAppointmentStatusRequest {
  appointmentId: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
}

export interface UpdateAppointmentStatusResponse {
  status: boolean
  message: string
  data?: {
    appointment: {
      id: string
      patientId: string
      doctorId: string
      appointmentTime: string
      status: string
      createdAt: string
      updatedAt: string
    }
  }
  error?: string
}

type AxiosErrorResponse = {
  response?: {
    data?: {
      error?: string
    }
  }
}

/**
 * Get all doctors
 */
export const getDoctors = async (): Promise<DoctorsResponse> => {
  try {
    const response = await api.get<DoctorsResponse>("/patient/get-doctors")
    return response.data
  } catch (error: unknown) {
    const axiosError = error as AxiosErrorResponse
    throw new Error(axiosError.response?.data?.error || "Failed to fetch doctors")
  }
}

// Update the getAvailableDates function to use the actual API endpoint
export const getAvailableDates = async (
  doctorId: string,
  year: number,
  month: number,
): Promise<AvailableDatesResponse> => {
  try {
    const response = await api.get<AvailableDatesResponse>("/patient/available-dates", {
      params: {
        doctorId,
        year,
        month,
      },
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosErrorResponse
    throw new Error(axiosError.response?.data?.error || "Failed to fetch available dates")
  }
}

// Update the getAvailableSlots function to use the actual API endpoint
export const getAvailableSlots = async (doctorId: string, date: string): Promise<AvailableSlotsResponse> => {
  try {
    const response = await api.post<AvailableSlotsResponse>("/patient/available-slots", {
      doctorId,
      date,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosErrorResponse
    throw new Error(axiosError.response?.data?.error || "Failed to fetch available slots")
  }
}

/**
 * Book an appointment with a doctor
 */
export const bookAppointment = async (
  patientId: string,
  doctorId: string,
  appointmentTime: string,
): Promise<BookAppointmentResponse> => {
  try {
    const response = await api.post<BookAppointmentResponse>("/patient/book-appointment", {
      patientId,
      doctorId,
      appointmentTime,
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosErrorResponse
    throw new Error(axiosError.response?.data?.error || "Failed to book appointment")
  }
}

/**
 * Get all appointments for the current patient
 */
// In "@/actions/appointments.ts"
export const getPatientAppointments = async (status?: string) => {
  try {
    const response = await api.get("/patient/booked-appointment", {
      params: {
        status, // Passing the status to the backend
      },
    });
    return response.data; // assuming the response has a data field
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};


/**
 * Get all appointments for the current doctor
 */
export const getDoctorAppointments = async (): Promise<DoctorAppointmentsResponse> => {
  try {
    const response = await api.get<DoctorAppointmentsResponse>("/doctor/show-appointment")
    return response.data
  } catch (error) {
    const axiosError = error as AxiosErrorResponse
    return {
      status: false,
      message: axiosError.response?.data?.error || "Failed to fetch doctor appointments",
    }
  }
}

/**
 * Update the status of an appointment
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED",
): Promise<UpdateAppointmentStatusResponse> => {
  try {
    const response = await api.put<UpdateAppointmentStatusResponse>("/doctor/update-appointment-status", {
      appointmentId,
      status,
    })
    return response.data
  } catch (error) {
    return {
      status: false,
      message: (error as Error).message || "Failed to update appointment status",
    }
  }
}

// Update the formatTimeSlot function to properly handle timezone conversion
export const formatTimeSlot = (slot: TimeSlot): { startTime: string; endTime: string } => {
  // Create date objects from the time strings
  const startDate = new Date(slot.startTime)
  const endDate = new Date(slot.endTime)

  // Format the times in the user's local timezone
  return {
    startTime: startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    endTime: endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  }
}

// Update the formatAppointmentTime function to be more comprehensive
export const formatAppointmentTime = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting appointment time:", error)
    return isoString
  }
}

/**
 * Format a date to YYYY-MM-DD string without timezone conversion
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
