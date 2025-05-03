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


// export const getAvailableDatesForMonth = async (req: Request, res: Response): Promise<any> => {
//     try {
//       const { doctorId, year, month } = req.body;
  
//       if (!doctorId || !year || !month) {
//         return res.status(400).json({ error: "doctorId, year, and month are required" });
//       }
  
//       // Fetch doctor's weekly availability (days of week)
//       const weeklyAvailability = await prisma.doctorAvailability.findMany({
//         where: { doctorId },
//         select: { dayOfWeek: true },
//       });
  
//       if (!weeklyAvailability || weeklyAvailability.length === 0) {
//         return res.status(404).json({ error: "No availability found for the doctor." });
//       }
  
//       const availableWeekdays = new Set(weeklyAvailability.map(slot => slot.dayOfWeek));
//       console.log("Available weekdays for doctor:", availableWeekdays); // Debugging log
  
//       const daysInMonth = new Date(year, month, 0).getDate(); // Get last day of the month
//       const availableDates: string[] = [];
  
//       console.log(`Days in month: ${daysInMonth}`); // Debugging line to check the days in the month
  
//       // Loop through each day of the month and check if it's an available day
//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = new Date(year, month - 1, day); // JS months are 0-indexed
//         const weekday = date.toLocaleDateString("en-US", { weekday: "long" }); // Get correct weekday in local timezone
  
//         console.log(`Checking date: ${date.toString()} (Weekday: ${weekday})`); // Debugging line
  
//         // Check if this weekday is available for the doctor
//         if (availableWeekdays.has(weekday)) {
//           console.log(`Date ${date.toLocaleDateString("en-CA")} is available.`); // Debug log when the date is available
//           availableDates.push(date.toLocaleDateString("en-CA")); // Push date in "YYYY-MM-DD" format
//         } else {
//           console.log(`Date ${date.toLocaleDateString("en-CA")} is NOT available.`); // Debug log when the date is NOT available
//         }
//       }
  
//       console.log(`Available dates: ${availableDates}`); // Final list of available dates
  
//       return res.status(200).json({ availableDates });
//     } catch (error) {
//       console.error("Error fetching available dates:", error);
//       return res.status(500).json({ error: "Something went wrong." });
//     }
//   };


export const getAvailableDatesForMonth = async (req: Request, res: Response): Promise<any> => {
  try {
    const { doctorId, year, month } = req.query;

    if (!doctorId || !year || !month) {
      return res.status(400).json({ error: "doctorId, year, and month are required" });
    }

    // Convert year and month to numbers
    const parsedYear = parseInt(year as string);
    const parsedMonth = parseInt(month as string); // 1-indexed (e.g., May = 5)

    // Fetch doctor's availability (dayOfWeek field is important)
    const weeklyAvailability = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctorId as string },
      select: { dayOfWeek: true },
      distinct: ['dayOfWeek'], // Just in case duplicates exist
    });

    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      return res.status(404).json({ error: "No availability found for the doctor." });
    }

    // Make a set of available weekdays (e.g., "Monday", "Wednesday")
    const availableWeekdays = new Set(weeklyAvailability.map(slot => slot.dayOfWeek));

    // Get number of days in that month
    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();

    const availableDates: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, day)); // UTC date
      const weekday = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }); // Force weekday in UTC

      if (availableWeekdays.has(weekday)) {
        availableDates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
      }
    }

    return res.status(200).json({ availableDates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};


export const getAvailableAppointmentSlots = async (req: Request, res: Response): Promise<any> => {
  try {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date are required.' });
    }

    // Step 1: Parse date and find the weekday
    const selectedDate = new Date(date); // Expecting YYYY-MM-DD
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

    // Step 2: Fetch availability for that weekday
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek, // e.g., "Monday"
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (!availability || availability.length === 0) {
      return res.status(404).json({ error: 'No availability found for this doctor on the selected date.' });
    }

    // Step 3: Fetch existing appointments for this doctor on that date
    const startOfDayUTC = new Date(Date.UTC(
      selectedDate.getUTCFullYear(),
      selectedDate.getUTCMonth(),
      selectedDate.getUTCDate(),
      0, 0, 0
    ));
    const endOfDayUTC = new Date(Date.UTC(
      selectedDate.getUTCFullYear(),
      selectedDate.getUTCMonth(),
      selectedDate.getUTCDate(),
      23, 59, 59
    ));

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentTime: {
          gte: startOfDayUTC,
          lte: endOfDayUTC,
        },
      },
      select: {
        appointmentTime: true,
      },
    });

    const bookedTimestamps = new Set(
      bookedAppointments.map((appt) => new Date(appt.appointmentTime).getTime())
    );

    // Step 4: Generate slots for each availability period
    const availableSlots = [];

    for (const slot of availability) {
      // Combine selectedDate with startTime and endTime (which are time-only in UTC)
      const startParts = new Date(slot.startTime);
      const endParts = new Date(slot.endTime);

      const startHour = startParts.getUTCHours();
      const startMin = startParts.getUTCMinutes();

      const endHour = endParts.getUTCHours();
      const endMin = endParts.getUTCMinutes();

      let slotStart = new Date(Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        startHour,
        startMin
      ));

      let slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + 30);

      // Generate 30-minute slots within this availability
      const availabilityEnd = new Date(Date.UTC(
        selectedDate.getUTCFullYear(),
        selectedDate.getUTCMonth(),
        selectedDate.getUTCDate(),
        endHour,
        endMin
      ));

      while (slotEnd <= availabilityEnd) {
        if (!bookedTimestamps.has(slotStart.getTime())) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }

        slotStart = new Date(slotEnd);
        slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + 30);
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
  
      if (!patientId || !doctorId || !appointmentTime) {
        return res.status(400).json({ error: 'patientId, doctorId, and appointmentTime are required.' });
      }
  
      const appointmentDate = new Date(appointmentTime);
      const weekday = appointmentDate.toLocaleString('en-US', { weekday: 'long' });
  
      // Fetch all availabilities for that weekday
      const doctorAvailabilities = await prisma.doctorAvailability.findMany({
        where: {
          doctorId,
          dayOfWeek: weekday,
        },
      });
  
      // Extract the time from appointmentDate (hours and minutes)
      const appointmentHours = appointmentDate.getHours();
      const appointmentMinutes = appointmentDate.getMinutes();
  
      const isWithinAvailability = doctorAvailabilities.some((slot) => {
        const slotStartHours = slot.startTime.getHours();
        const slotStartMinutes = slot.startTime.getMinutes();
  
        const slotEndHours = slot.endTime.getHours();
        const slotEndMinutes = slot.endTime.getMinutes();
  
        const slotStartTotalMinutes = slotStartHours * 60 + slotStartMinutes;
        const slotEndTotalMinutes = slotEndHours * 60 + slotEndMinutes;
        const appointmentTotalMinutes = appointmentHours * 60 + appointmentMinutes;
  
        return appointmentTotalMinutes >= slotStartTotalMinutes && appointmentTotalMinutes < slotEndTotalMinutes;
      });
  
      if (!isWithinAvailability) {
        return res.status(400).json({ error: 'The doctor is not available at this time.' });
      }
  
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          doctorId,
          appointmentTime: appointmentDate,
        },
      });
  
      if (existingAppointment) {
        return res.status(400).json({ error: 'The selected time slot is already booked.' });
      }
  
      const newAppointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          appointmentTime: appointmentDate,
          status: 'PENDING',
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
  
      try {
        await sendAppointmentConfirmationEmail(newAppointment.patient.email, appointmentDetails);
        console.log('Appointment confirmation email sent to:', newAppointment.patient.email);
      } catch (error) {
        console.error('Error sending appointment confirmation email:', error);
      }
  
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

export const getPatientAppointments = async (req: Request, res: Response): Promise<any> => {
    try {
      const patientId = req.user?.userId; // assumes user is logged in as a patient
  
      if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required.' });
      }
  
      const appointments = await prisma.appointment.findMany({
        where: {
          patientId,
        },
        orderBy: {
          appointmentTime: 'asc',
        },
        include: {
          doctor: {
            include: {
              user: true, // to get doctor's name and email
            },
          },
        },
      });
  
      if (appointments.length === 0) {
        return res.status(404).json({ error: 'No appointments found for this patient.' });
      }
  
      // Format the response
      const formattedAppointments = appointments.map((appt) => ({
        appointmentId: appt.id,
        appointmentTime: appt.appointmentTime,
        status: appt.status,
        doctorName: `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`,
        doctorEmail: appt.doctor.user.email,
        doctorSpecialization: appt.doctor.specialization,
      }));
  
      return res.status(200).json({ appointments: formattedAppointments });
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return res.status(500).json({ error: 'Something went wrong while fetching appointments.' });
    }
  };

export const searchDoctors = async (req: Request, res: Response): Promise<any> => {
    try {
      const { search, specialty } = req.query;
  
      const doctors = await prisma.user.findMany({
        where: {
          role: 'DOCTOR',
          doctorProfile: {
            status: 'APPROVED',
            ...(specialty && {
              specialization: {
                contains: specialty as string,
                mode: 'insensitive',
              },
            }),
          },
          ...(search && {
            OR: [
              {
                firstName: {
                  contains: search as string,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: search as string,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },
        include: {
          doctorProfile: true,
        },
      });
  
      const formattedDoctors = doctors.map((doc) => ({
        id: doc.id, 
        name: `${doc.firstName} ${doc.lastName}`,
        specialty: doc.doctorProfile?.specialization || '',
        experience:
          new Date().getFullYear() -
          new Date(doc.doctorProfile?.startedPracticeOn ?? new Date()).getFullYear(),
      }));
  
      return res.status(200).json({ doctors: formattedDoctors });
    } catch (error) {
      console.error('Error searching doctors:', error);
      return res.status(500).json({ error: 'Something went wrong while searching for doctors.' });
    }
  };
