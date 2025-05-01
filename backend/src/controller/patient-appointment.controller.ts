import { Request, Response } from 'express';
import { AppointmentSlot, checkForConflicts, generateSlotsForAvailability, getDoctorAvailabilityForDay } from '../helper/AppointmentUtils';
import { prisma } from '../utils/prismaConnection';
import { sendAppointmentConfirmationEmail } from '../utils/emailConnection';

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


export const getAvailableAppointmentSlots = async (req: Request, res: Response): Promise<any> => {
    try {
      const { doctorId, date } = req.body; // Get doctorId and date from the request body
  
      if (!doctorId || !date) {
        return res.status(400).json({ error: 'doctorId and date are required.' });
      }
  
      // Convert the date string to a Date object
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)); // Start of the selected day
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)); // End of the selected day
  
      // Fetch doctor’s availability for the selected date
      const availability = await prisma.doctorAvailability.findMany({
        where: {
          doctorId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
  
      if (!availability || availability.length === 0) {
        return res.status(404).json({ error: 'No availability found for this doctor on the selected date.' });
      }
  
      // Generate 30-minute appointment slots based on the doctor's availability
      const availableSlots = [];
  
      for (const slot of availability) {
        let currentStartTime = new Date(slot.startTime);
        let currentEndTime = new Date(currentStartTime);
        currentEndTime.setMinutes(currentEndTime.getMinutes() + 30); // Each slot is 30 minutes long
  
        // Generate slots until the end of the availability period
        while (currentEndTime <= slot.endTime) {
          availableSlots.push({
            startTime: currentStartTime.toISOString(),
            endTime: currentEndTime.toISOString(),
          });
  
          // Move to the next 30-minute slot
          currentStartTime = new Date(currentEndTime);
          currentEndTime = new Date(currentStartTime);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + 30);
        }
      }
  
      return res.status(200).json({ availableSlots });
  
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      return res.status(500).json({ error: 'Something went wrong while fetching appointment slots.' });
    }
  };



  export const bookAppointment = async (req: Request, res: Response): Promise<any> => {
    try {
      const { patientId, doctorId, appointmentTime } = req.body;
  
      // Validate the input
      if (!patientId || !doctorId || !appointmentTime) {
        return res.status(400).json({ error: 'patientId, doctorId, and appointmentTime are required.' });
      }
  
      // Convert appointment time to Date object
      const appointmentDate = new Date(appointmentTime);
  
      // 1. Check if the doctor has availability at the requested time
      const doctorAvailability = await prisma.doctorAvailability.findFirst({
        where: {
          doctorId,
          startTime: {
            lte: appointmentDate, // Check if the requested appointment time is after the start time
          },
          endTime: {
            gte: appointmentDate, // Check if the requested appointment time is before the end time
          },
          dayOfWeek: appointmentDate.toLocaleString('en-US', { weekday: 'long' }), // Ensure it's on a day the doctor is available
        },
      });
  
      if (!doctorAvailability) {
        return res.status(400).json({ error: 'The doctor is not available at this time.' });
      }
  
      // 2. Check if the time slot is already booked
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          appointmentTime: appointmentDate,
        },
      });
  
      if (existingAppointment) {
        return res.status(400).json({ error: 'The selected time slot is already booked.' });
      }
  
      // 3. Create the new appointment
      const newAppointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          appointmentTime: appointmentDate,
          status: 'PENDING', // Appointment is booked but not yet confirmed
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              specialization: true,
            },
          },
        },
      });
  
      // 4. Prepare appointment details directly
      const appointmentDetails = {
        patientName: `${newAppointment.patient.firstName} ${newAppointment.patient.lastName}`,
        patientEmail: newAppointment.patient.email,
        patientPhone: newAppointment.patient.phone,
        appointmentTime: newAppointment.appointmentTime,
        status: newAppointment.status,
        doctorName: `${newAppointment.doctor.user.firstName} ${newAppointment.doctor.user.lastName}`,
        doctorSpecialization: newAppointment.doctor.specialization,
        doctorEmail: newAppointment.doctor.user.email,
      };
  
      // 5. Send appointment confirmation email to the patient
      try {
        await sendAppointmentConfirmationEmail(newAppointment.patient.email, appointmentDetails); // Send email
        console.log('Appointment confirmation email sent to:', newAppointment.patient.email);
      } catch (error) {
        console.error('Error sending appointment confirmation email:', error);
      }
  
      // 6. Respond with the appointment details
      return res.status(201).json({
        message: 'Appointment booked successfully.',
        appointment: newAppointment,
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      return res.status(500).json({ error: 'Something went wrong while booking the appointment.' });
    }
  };
  


export const getDoctorAppointments = async (req: Request, res: Response): Promise<any> => {
    try {
      const doctorId = req.user?.userId;// Doctor's ID passed as URL parameter
      console.log(doctorId);
      
  
      // Validate the input
      if (!doctorId) {
        return res.status(400).json({ error: 'doctorId is required.' });
      }
  
      // Fetch appointments for the doctor, include related patient and doctor data
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId,
        },
        include: {
          patient: {  // Include patient details from the User model
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true, // Add any other fields you want to include
            },
          },
          doctor: {   // Include doctor details from the DoctorProfile model
            select: {
              user: {  // Access User data for the doctor
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              specialization: true,
            },
          },
        },
      });
  
      // Check if no appointments are found
      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: 'No appointments found for this doctor.' });
      }
  
      // Return the list of appointments with patient and doctor details
      return res.status(200).json({
        appointments: appointments.map(appointment => ({
          appointmentId: appointment.id,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientEmail: appointment.patient.email,
          patientPhone: appointment.patient.phone, // Optional: Add any additional patient info here
          appointmentTime: appointment.appointmentTime,
          status: appointment.status,
          doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
          doctorSpecialization: appointment.doctor.specialization,
          doctorEmail: appointment.doctor.user.email, // Optional: Add email if needed
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        })),
      });
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return res.status(500).json({ error: 'Something went wrong while fetching the appointments.' });
    }
  };
