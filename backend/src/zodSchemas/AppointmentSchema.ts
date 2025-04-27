import { z } from "zod";

export const TimeSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

export const DoctorAvailabilitySchema = z.object({
  dayOfWeek: z.number(),
  timeSlots: z.array(TimeSlotSchema), // This expects an array of time slot objects
});
