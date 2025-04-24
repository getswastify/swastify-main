import { z } from "zod"
import { BLOOD_GROUPS, SPECIALIZATIONS } from "@/types/profile"

// Patient Profile Schema
export const patientProfileSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS, {
    errorMap: () => ({ message: "Please select a valid blood group" }),
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  height: z.coerce.number().min(50, "Height must be at least 50 cm").max(250, "Height must be less than 250 cm"),
  weight: z.coerce.number().min(10, "Weight must be at least 10 kg").max(300, "Weight must be less than 300 kg"),
})

// Doctor Profile Schema
export const doctorProfileSchema = z.object({
  specialization: z.enum(SPECIALIZATIONS, {
    errorMap: () => ({ message: "Please select a valid specialization" }),
  }),
  clinicAddress: z.string().min(5, "Clinic address must be at least 5 characters"),
  consultationFee: z.coerce
    .number()
    .min(0, "Consultation fee cannot be negative")
    .max(10000, "Consultation fee must be less than 10,000"),
  availableFrom: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
  availableTo: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),
})

// Hospital Profile Schema
export const hospitalProfileSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  services: z.string().min(5, "Services must be at least 5 characters"),
})

export type PatientProfileFormValues = z.infer<typeof patientProfileSchema>
export type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>
export type HospitalProfileFormValues = z.infer<typeof hospitalProfileSchema>
