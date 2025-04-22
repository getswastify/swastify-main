import { z } from "zod";

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
