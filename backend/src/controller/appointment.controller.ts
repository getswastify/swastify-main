import { Request, Response } from 'express';
import { AppointmentSlot, checkForConflicts, generateSlotsForAvailability, getDoctorAvailabilityForDay } from '../helper/AppointmentUtils';
import { prisma } from '../utils/prismaConnection';

// API endpoint to get dynamic appointment slots for a doctor
export const getDynamicAppointmentSlots = async (req: Request, res: Response): Promise<any> => {
    try {
      const { doctorId, dayOfWeek } = req.body;

  
      if (!doctorId || !dayOfWeek) {
        return res.status(400).json({ error: 'Doctor ID and dayOfWeek are required.' });
      }
  
      // Step 1: Get doctor's availability for the given day
      const availability = await getDoctorAvailabilityForDay(doctorId, dayOfWeek as string);
  
      // Step 2: Generate dynamic slots for each availability period
      const generatedSlots = generateSlotsForAvailability(availability);
  
      // Step 3: Check for conflicts in each generated slot
      const availableSlots: AppointmentSlot[] = [];
      for (const slot of generatedSlots) {
        const conflict = await checkForConflicts(doctorId, slot);
        if (!conflict) {
          availableSlots.push(slot);
        }
      }
  
      return res.status(200).json({ availableSlots });
    } catch (error) {
      console.error('Error generating appointment slots:', error);
      return res.status(500).json({ error: 'Something went wrong while generating slots.' });
    }
  };


  export const getAvailableDatesForMonth = async (req: Request, res: Response): Promise<any> => {
    try {
      const { doctorId, year, month } = req.body;
  
      if (!doctorId || !year || !month) {
        return res.status(400).json({ error: "doctorId, year, and month are required" });
      }
  
      // Fetch doctor's weekly availability (days of week)
      const weeklyAvailability = await prisma.doctorAvailability.findMany({
        where: { doctorId },
        select: { dayOfWeek: true },
      });
  
      if (!weeklyAvailability || weeklyAvailability.length === 0) {
        return res.status(404).json({ error: "No availability found for the doctor." });
      }
  
      const availableWeekdays = new Set(weeklyAvailability.map(slot => slot.dayOfWeek));
      console.log("Available weekdays for doctor:", availableWeekdays); // Debugging log
  
      // Map days of the week to JS number representation (0: Sunday, 1: Monday, etc.)
      const dayMap = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
      };
  
      const daysInMonth = new Date(year, month, 0).getDate(); // Get last day of the month
      const availableDates: string[] = [];
  
      console.log(`Days in month: ${daysInMonth}`); // Debugging line to check the days in the month
  
      // Loop through each day of the month and check if it's an available day
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day); // JS months are 0-indexed
        const weekday = date.toLocaleDateString("en-US", { weekday: "long" }); // Get correct weekday in local timezone
  
        console.log(`Checking date: ${date.toString()} (Weekday: ${weekday})`); // Debugging line
  
        // Check if this weekday is available for the doctor
        if (availableWeekdays.has(weekday)) {
          console.log(`Date ${date.toLocaleDateString("en-CA")} is available.`); // Debug log when the date is available
          availableDates.push(date.toLocaleDateString("en-CA")); // Push date in "YYYY-MM-DD" format
        } else {
          console.log(`Date ${date.toLocaleDateString("en-CA")} is NOT available.`); // Debug log when the date is NOT available
        }
      }
  
      console.log(`Available dates: ${availableDates}`); // Final list of available dates
  
      return res.status(200).json({ availableDates });
    } catch (error) {
      console.error("Error fetching available dates:", error);
      return res.status(500).json({ error: "Something went wrong." });
    }
  };
  