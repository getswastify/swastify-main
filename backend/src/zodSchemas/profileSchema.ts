import { z } from "zod";


export const PatientProfileSchema = z.object({
  bloodGroup: z.enum([
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
  ], {
    required_error: "Please select your blood group",
  }),
  address: z.string().min(5, "Address is too short"),
  height: z.number({ invalid_type_error: "Height must be a number" }).positive("Height must be positive"),
  weight: z.number({ invalid_type_error: "Weight must be a number" }).positive("Weight must be positive"),
  allergies: z.string().max(1000, "Allergies can't exceed 1000 characters").optional(),
  diseases: z.string().max(1000, "Diseases can't exceed 1000 characters").optional(),
});



export const DoctorProfileSchema = z.object({
  specialization: z.string().min(3, "Specialization must be at least 3 characters"),
  clinicAddress: z.string().min(5, "Clinic address is too short"),
  consultationFee: z
    .number({
      invalid_type_error: "Consultation fee must be a number",
    })
    .positive("Consultation fee must be greater than 0"),
  availableFrom: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "availableFrom must be in HH:mm format",
  }),
  availableTo: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "availableTo must be in HH:mm format",
  }),
});

export const HospitalProfileSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  services: z.string().min(5, "Please describe at least one service"),
});
