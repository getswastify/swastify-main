import { z } from "zod"
import {  SPECIALIZATIONS } from "@/types/profile"

// Patient Profile Schema
export const patientProfileSchema = z.object({
  bloodGroup: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]),
  address: z.string(),
  height: z.number(),
  weight: z.number(),
  allergies: z.array(z.string()),
  diseases: z.array(z.string()),
});

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
  startedPracticeOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
  licenseNumber: z.string().min(3, "License number must be at least 3 characters"),
  licenseIssuedBy: z.string().min(3, "License issuing authority must be at least 3 characters"),
  licenseDocumentUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
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
