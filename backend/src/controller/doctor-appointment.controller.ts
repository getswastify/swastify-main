import { Request, Response } from "express";
import { prisma } from "../utils/prismaConnection";
import { sendAppointmentStatusUpdateEmail } from "../utils/emailConnection";
import { createGoogleMeetEvent } from "../utils/googleMeet";
import { google } from "googleapis";
import { AppointmentStatus } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/doctor/calendar-callback"
);

export const connectGoogleCalendar = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email", // ✅ added this so we can fetch email
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    return res.status(200).json({
      status: true,
      url,
      message: "Redirect to Google Calendar connect",
    });
  } catch (error) {
    console.error("❌ Error generating Google OAuth URL:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to generate Google Calendar connection URL.",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Step 2: Handle OAuth2 callback and save tokens
export const googleCalendarCallback = async (
  req: Request,
  res: Response
): Promise<any> => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({
      status: false,
      message: "Authorization code missing from request.",
    });
  }

  try {
    console.log("📥 Received code:", code);

    // Get tokens using the code
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    oauth2Client.setCredentials(tokens); // ✅ set credentials FIRST before making requests

    // Get Google user info using oauth2 API
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoResponse = await oauth2.userinfo.get();
    const email = userInfoResponse.data.email;

    console.log("📧 Google Email:", email);

    // Extract doctor ID from auth middleware
    const doctorId = req.user?.userId;
    console.log("🧑‍⚕️ Doctor ID:", doctorId);

    if (!doctorId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. No doctor ID found.",
      });
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId },
    });

    if (!doctorProfile) {
      return res.status(404).json({
        status: false,
        message: "Doctor profile not found.",
      });
    }

    // Save tokens and email to DB
    await prisma.doctorProfile.update({
      where: { userId: doctorId },
      data: {
        googleAccessToken: tokens.access_token ?? null,
        googleRefreshToken: tokens.refresh_token ?? null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        googleEmail: email ?? null,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Google Calendar connected successfully.",
    });
  } catch (error) {
    console.error("❌ Callback error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to connect Google Calendar.",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Get Doctor Appointments
export const getDoctorAppointments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const doctorId = req.user?.userId;

    if (!doctorId) {
      return res.status(400).json({
        status: false,
        message: "Doctor ID is required.",
        error: "Missing doctorId from request context.",
      });
    }

    const {
      search,
      status,
      sortBy,
      sortOrder,
      page = "1",
      limit = "10",
      startDate,
      endDate,
    } = req.query;

    let filters: any = {
      doctorId,
    };

    // Search logic
    if (search && typeof search === "string") {
      filters.OR = [
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { patient: { email: { contains: search, mode: "insensitive" } } },
        { patient: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filter
    if (
      status &&
      typeof status === "string" &&
      status.toUpperCase() in AppointmentStatus
    ) {
      filters.status = status.toUpperCase() as AppointmentStatus;
    }

    // Date range filter - Simplified
    if (startDate || endDate) {
      filters.appointmentTime = {};

      if (startDate) {
        filters.appointmentTime.gte = new Date(startDate as string); // Start date filter (greater than or equal)
      }
      if (endDate) {
        filters.appointmentTime.lte = new Date(endDate as string); // End date filter (less than or equal)
      }
    }

    // Pagination
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Sorting
    const sortField = typeof sortBy === "string" ? sortBy : "appointmentTime";
    const sortDirection =
      sortOrder === "desc" || sortOrder === "asc" ? sortOrder : "asc";

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where: filters,
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
        orderBy: {
          [sortField]: sortDirection,
        },
        skip,
        take: pageSize,
      }),
      prisma.appointment.count({ where: filters }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Doctor appointments fetched successfully.",
      data: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        appointments: appointments.map((appointment) => ({
          appointmentId: appointment.id,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientEmail: appointment.patient.email,
          patientPhone: appointment.patient.phone,
          appointmentTime: appointment.appointmentTime,
          status: appointment.status,
          doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
          doctorSpecialization: appointment.doctor.specialization,
          doctorEmail: appointment.doctor.user.email,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while fetching the appointments.",
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

// Update Appointment Status
export const updateAppointmentStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const isGoogleCalendarConnected = async (doctorUserId: string): Promise<boolean> => {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      select: {
        googleRefreshToken: true,
      },
    });

    return !!doctor?.googleRefreshToken;
  };

  try {
    const doctorId = req.user?.userId;
    const { appointmentId, status } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        status: false,
        message: "appointmentId and status are required.",
        data: { error: "Missing fields in request body." },
      });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status.",
        data: { error: "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED" },
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this appointment.",
        data: { error: "Unauthorized access." },
      });
    }

    let meetLink: string | null = null;

    // 👇 Generate meet link if confirming and doctor has Google connected
    if (status === "CONFIRMED") {
      const isConnected = await isGoogleCalendarConnected(doctorId);
      if (!isConnected) {
        return res.status(400).json({
          status: false,
          message: "Please connect your Google Calendar to confirm appointments.",
          data: { error: "Google Calendar is not connected." },
        });
      }

      const startTime = new Date(appointment.appointmentTime);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

      meetLink = await createGoogleMeetEvent(
        doctorId,
        startTime.toISOString(),
        endTime.toISOString(),
        appointment.doctor.user.email,
        appointment.patient.email
      );
    }

    // ✅ Update appointment with new status and meet link
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(meetLink && { meetLink }),
      },
    });

    // ✨ Log the status change
    await prisma.appointmentStatusLog.create({
      data: {
        appointmentId,
        status,
        updatedBy: doctorId,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Appointment status updated successfully.",
      data: {
        appointment: updatedAppointment,
      },
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while updating the appointment status.",
      data: {
        error: error instanceof Error ? error.message : "Internal server error",
      },
    });
  }
};


export const getAppointmentDetails = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({
        status: false,
        message: "Appointment ID is required.",
        data: "error",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePicture: true, // 👈 Added patient image
          },
        },
        doctor: {
          select: {
            specialization: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true, // 👈 Added doctor image
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: false,
        message: "Appointment not found.",
        data: "error",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Appointment details fetched successfully.",
      data: {
        appointmentId: appointment.id,
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientEmail: appointment.patient.email,
        patientPhone: appointment.patient.phone,
        patientImage: appointment.patient.profilePicture, // ✅ Included in response
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        meetLink: appointment.meetLink ?? "Not Available",
        doctorName: `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`,
        doctorSpecialization: appointment.doctor.specialization,
        doctorEmail: appointment.doctor.user.email,
        doctorImage: appointment.doctor.user.profilePicture, // ✅ Included in response
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong while fetching the appointment details.",
      data: "error",
    });
  }
};
