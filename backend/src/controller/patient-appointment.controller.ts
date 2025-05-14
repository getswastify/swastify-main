import { Request, Response } from "express";
import {
  AppointmentSlot,
  checkForConflicts,
  generateSlotsForAvailability,
  getDoctorAvailabilityForDay,
} from "../helper/AppointmentUtils";
import { prisma } from "../utils/prismaConnection";
import {
  sendDoctorAppointmentPendingEmail,
  sendPatientAppointmentConfirmationEmail,
} from "../utils/emailConnection";
import { calculateExperience } from "../helper/CalculateExperience";

// API endpoint to get dynamic appointment slots for a doctor
export const getDynamicAppointmentSlots = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { doctorId, dayOfWeek } = req.body;

    if (!doctorId || !dayOfWeek) {
      return res
        .status(400)
        .json({ error: "Doctor ID and dayOfWeek are required." });
    }

    // Step 1: Get doctor's availability for the given day
    const availability = await getDoctorAvailabilityForDay(
      doctorId,
      dayOfWeek as string
    );

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
    console.error("Error generating appointment slots:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong while generating slots." });
  }
};

export const getAvailableDatesForMonth = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { doctorId, year, month } = req.query;

    if (!doctorId || !year || !month) {
      return res
        .status(400)
        .json({ error: "doctorId, year, and month are required" });
    }

    // Convert year and month to numbers
    const parsedYear = parseInt(year as string);
    const parsedMonth = parseInt(month as string); // 1-indexed (e.g., May = 5)

    // Fetch doctor's availability (dayOfWeek field is important)
    const weeklyAvailability = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctorId as string },
      select: { dayOfWeek: true },
      distinct: ["dayOfWeek"], // Just in case duplicates exist
    });

    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      return res
        .status(404)
        .json({ error: "No availability found for the doctor." });
    }

    // Make a set of available weekdays (e.g., "Monday", "Wednesday")
    const availableWeekdays = new Set(
      weeklyAvailability.map((slot) => slot.dayOfWeek)
    );

    // Get number of days in that month
    const daysInMonth = new Date(parsedYear, parsedMonth, 0).getDate();

    const availableDates: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, day)); // UTC date
      const weekday = date.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }); // Force weekday in UTC

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

// 👇 This helper merges the selected date with a time (in IST) and returns a UTC Date
const combineISTTimeWithDate = (
  date: Date,
  hours: number,
  minutes: number
): Date => {
  const [year, month, day] = date
    .toISOString()
    .split("T")[0]
    .split("-")
    .map(Number);
  const istDate = new Date(
    Date.UTC(year, month - 1, day, hours - 5, minutes - 30)
  ); // IST is UTC+5:30
  return istDate;
};

export const getAvailableAppointmentSlots = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ error: "doctorId and date are required." });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });

    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    if (!availability || availability.length === 0) {
      return res.status(404).json({
        error: "No availability found for this doctor on the selected date.",
      });
    }

    const istStartOfDay = combineISTTimeWithDate(selectedDate, 0, 0);
    const istEndOfDay = combineISTTimeWithDate(selectedDate, 23, 59);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentTime: {
          gte: istStartOfDay,
          lte: istEndOfDay,
        },
      },
      select: {
        appointmentTime: true,
      },
    });

    const bookedTimestamps = new Set(
      bookedAppointments.map((appt) => new Date(appt.appointmentTime).getTime())
    );

    // Current time in UTC with 1.5 hours added
    const now = new Date();
    const nowWithBuffer = new Date(now.getTime() + 90 * 60000); // 90 minutes = 1.5 hours

    const availableSlots = [];

    for (const slot of availability) {
      const startTimeIST = new Date(slot.startTime);
      const endTimeIST = new Date(slot.endTime);

      const startHour = startTimeIST.getHours();
      const startMinute = startTimeIST.getMinutes();
      const endHour = endTimeIST.getHours();
      const endMinute = endTimeIST.getMinutes();

      let slotStart = combineISTTimeWithDate(
        selectedDate,
        startHour,
        startMinute
      );
      let slotEnd = new Date(slotStart.getTime() + 30 * 60000);

      const finalSlotEnd = combineISTTimeWithDate(
        selectedDate,
        endHour,
        endMinute
      );

      while (slotEnd <= finalSlotEnd) {
        const isSlotBooked = bookedTimestamps.has(slotStart.getTime());
        const isInPast = slotStart.getTime() < nowWithBuffer.getTime();

        if (!isSlotBooked && !isInPast) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            displayTime: slotStart.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            }),
          });
        }

        slotStart = slotEnd;
        slotEnd = new Date(slotStart.getTime() + 30 * 60000);
      }
    }

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return res.status(500).json({
      error: "Something went wrong while fetching appointment slots.",
    });
  }
};

export const bookAppointment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { patientId, doctorId, appointmentTime } = req.body;

    if (!patientId || !doctorId || !appointmentTime) {
      return res.status(400).json({
        error: "patientId, doctorId, and appointmentTime are required.",
      });
    }

    const appointmentDate = new Date(appointmentTime);
    const weekday = appointmentDate.toLocaleString("en-US", {
      weekday: "long",
    });

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
      const appointmentTotalMinutes =
        appointmentHours * 60 + appointmentMinutes;

      return (
        appointmentTotalMinutes >= slotStartTotalMinutes &&
        appointmentTotalMinutes < slotEndTotalMinutes
      );
    });

    if (!isWithinAvailability) {
      return res
        .status(400)
        .json({ error: "The doctor is not available at this time." });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentTime: appointmentDate,
      },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ error: "The selected time slot is already booked." });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentTime: appointmentDate,
        status: "PENDING",
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
            consultationFee: true,
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
      consultationFee: newAppointment.doctor.consultationFee,
    };

    try {
      // Send to patient
      await sendPatientAppointmentConfirmationEmail(
        newAppointment.patient.email,
        appointmentDetails
      );
      console.log(
        "Appointment confirmation email sent to patient:",
        newAppointment.patient.email
      );

      // Send to doctor
      await sendDoctorAppointmentPendingEmail(
        newAppointment.doctor.user.email,
        appointmentDetails
      );
      console.log(
        "Appointment confirmation email sent to doctor:",
        newAppointment.doctor.user.email
      );
    } catch (error) {
      console.error("Error sending appointment confirmation email:", error);
    }

    return res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong while booking the appointment." });
  }
};

export const getDoctorAppointments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const doctorId = req.user?.userId; // Doctor's ID passed as URL parameter
    console.log(doctorId);

    // Validate the input
    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required." });
    }

    // Fetch appointments for the doctor, include related patient and doctor data
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
      },
      include: {
        patient: {
          // Include patient details from the User model
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true, // Add any other fields you want to include
          },
        },
        doctor: {
          // Include doctor details from the DoctorProfile model
          select: {
            user: {
              // Access User data for the doctor
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
      return res
        .status(404)
        .json({ message: "No appointments found for this doctor." });
    }

    // Return the list of appointments with patient and doctor details
    return res.status(200).json({
      appointments: appointments.map((appointment) => ({
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
    console.error("Error fetching doctor appointments:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong while fetching the appointments." });
  }
};

export const getPatientAppointments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const patientId = req.user?.userId; // assumes user is logged in as a patient

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required." });
    }

    const { status } = req.query; // Extract status filter from query params

    const filterConditions: any = {
      patientId,
    };

    // Add status filter if it's provided
    if (status) {
      if (status === "upcoming") {
        filterConditions.appointmentTime = {
          gte: new Date(), // Greater than or equal to the current date/time
        };
      } else if (status === "past") {
        filterConditions.appointmentTime = {
          lt: new Date(), // Less than the current date/time
        };
      } else if (status === "cancelled") {
        filterConditions.status = "CANCELLED";
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: filterConditions,
      orderBy: {
        appointmentTime: "asc",
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
      return res
        .status(200)
        .json({
          status: false,
          appointments:[],
          message: "No appointments found for this patient.",
        });
    }

    // Format the response
    const formattedAppointments = appointments.map((appt) => ({
      appointmentId: appt.id,
      appointmentTime: appt.appointmentTime,
      status: appt.status,
      doctorImage: appt.doctor.user.profilePicture,
      doctorName: `${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`,
      doctorEmail: appt.doctor.user.email,
      doctorSpecialization: appt.doctor.specialization,
    }));

    return res.status(200).json({ appointments: formattedAppointments });
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong while fetching appointments." });
  }
};

export const getPatientAppointmentDetail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const patientId = req.user?.userId;
    const { appointmentId } = req.params;

    if (!patientId || !appointmentId) {
      return res.status(400).json({ error: "Patient ID and Appointment ID are required." });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId,
      },
      include: {
        doctor: {
          include: {
            user: true, // 👈 this works because doctor is DoctorProfile and has `user`
          },
        },
        patient: true, // 👈 this is already a User model, so no need for `.user`
        AppointmentStatusLog: {
          orderBy: {
            changedAt: 'asc',
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: false,
        message: "Appointment not found or unauthorized.",
      });
    }

    const timeline = appointment.AppointmentStatusLog.map((log, index) => ({
      id: index + 1,
      title: getTimelineTitle(log.status),
      description: getTimelineDescription(log.status),
      timestamp: log.changedAt,
      type: log.status,
    }));

    const formattedAppointment = {
      appointmentId: appointment.id,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      meetLink: appointment.meetLink,

      // Doctor details
      doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
      doctorEmail: appointment.doctor.googleEmail,
      doctorImage: appointment.doctor.user.profilePicture,
      clinicAddress: appointment.doctor.clinicAddress,
      doctorSpecialization: appointment.doctor.specialization,
      experience: calculateExperience(appointment.doctor.startedPracticeOn.toISOString()),

      // Patient details
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      patientEmail: appointment.patient.email,
      patientPhone: appointment.patient.phone,
      patientImage: appointment.patient.profilePicture,

      // Meta
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      timeline,
    };

    return res.status(200).json({
      status: true,
      message: "Appointment details fetched successfully.",
      data: formattedAppointment,
    });
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return res.status(500).json({
      error: "Something went wrong while fetching appointment detail.",
    });
  }
};


// Helper: Timeline title
const getTimelineTitle = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Appointment Booked';
    case 'CONFIRMED':
      return 'Appointment Confirmed';
    case 'CANCELLED':
      return 'Appointment Cancelled';
    case 'COMPLETED':
      return 'Appointment Completed';
    default:
      return 'Status Updated';
  }
};

// Helper: Timeline description
const getTimelineDescription = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Your appointment has been successfully booked.';
    case 'CONFIRMED':
      return 'Your appointment has been confirmed by the doctor.';
    case 'CANCELLED':
      return 'Your appointment was cancelled.';
    case 'COMPLETED':
      return 'Your appointment was completed.';
    default:
      return 'Your appointment status was updated.';
  }
};

export const searchDoctors = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { search, specialty } = req.query;

    const doctors = await prisma.user.findMany({
      where: {
        role: "DOCTOR",
        doctorProfile: {
          status: "APPROVED",
          ...(specialty && {
            specialization: {
              contains: specialty as string,
              mode: "insensitive",
            },
          }),
        },
        ...(search && {
          OR: [
            {
              firstName: {
                contains: search as string,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search as string,
                mode: "insensitive",
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
      userId: doc.id,
      name: `${doc.firstName} ${doc.lastName}`,
      specialty: doc.doctorProfile?.specialization || "",
      experience:
        new Date().getFullYear() -
        new Date(doc.doctorProfile?.startedPracticeOn ?? new Date()).getFullYear(),
      profilePicture: doc.profilePicture || null,
      consultationFee: doc.doctorProfile?.consultationFee || null,
      clinicAddress: doc.doctorProfile?.clinicAddress || "",
    }));

    return res.status(200).json({ doctors: formattedDoctors });
  } catch (error) {
    console.error("Error searching doctors:", error);
    return res
      .status(500)
      .json({ error: "Something went wrong while searching for doctors." });
  }
};


export const cancelAppointment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const patientId = req.user?.userId;
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required." });
    }

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    if (appointment.patientId !== patientId) {
      return res.status(403).json({
        error: "You are not authorized to cancel this appointment.",
      });
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
    });

    // Log to AppointmentStatusLog
    await prisma.appointmentStatusLog.create({
      data: {
        appointmentId: appointmentId,
        status: "CANCELLED",
        changedAt: new Date(), // optional if your schema auto-generates
      },
    });

    return res
      .status(200)
      .json({ message: "Appointment cancelled successfully 🚫" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({
      error: "Something went wrong while cancelling the appointment.",
    });
  }
};
