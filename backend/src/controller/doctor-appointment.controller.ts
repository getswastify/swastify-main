import { Request, Response } from "express";
import { prisma } from "../utils/prismaConnection";
import { sendAppointmentStatusUpdateEmail } from "../utils/emailConnection";
import { createGoogleMeetEvent } from "../utils/googleMeet";
import { google } from "googleapis";
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

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
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

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No appointments found for this doctor.",
        error: "No records available.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Doctor appointments fetched successfully.",
      data: {
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

    console.log("Google token check result:", doctor);
    return !!doctor?.googleRefreshToken;
  };

  try {
    const doctorId = req.user?.userId;
    const { appointmentId, status } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        status: false,
        message: "appointmentId and status are required.",
        data: {
          error: "Missing fields in request body.",
        },
      });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid status.",
        data: {
          error: "Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED",
        },
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this appointment.",
        data: {
          error: "Unauthorized access.",
        },
      });
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Fetch full appointment details for email
    const fullDetails = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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

    if (fullDetails && fullDetails.patient && fullDetails.doctor) {
      const appointmentDetails = {
        patientName: `${fullDetails.patient.firstName} ${fullDetails.patient.lastName}`,
        patientEmail: fullDetails.patient.email,
        doctorName: `${fullDetails.doctor.user.firstName} ${fullDetails.doctor.user.lastName}`,
        doctorSpecialization: fullDetails.doctor.specialization,
        doctorEmail: fullDetails.doctor.user.email,
        consultationFee: fullDetails.doctor.consultationFee,
        appointmentTime: fullDetails.appointmentTime,
        status: fullDetails.status,
      };

      if (status === "CONFIRMED") {
        const isConnected = await isGoogleCalendarConnected(doctorId);
        if (!isConnected) {
          return res.status(400).json({
            status: false,
            message: "Please connect your Google Calendar to confirm appointments.",
            data: {
              error: "Google Calendar is not connected.",
            },
          });
        }

        const startTime = new Date(fullDetails.appointmentTime);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        const meetLink = await createGoogleMeetEvent(
          doctorId,
          startTime.toISOString(),
          endTime.toISOString(),
          fullDetails.doctor.user.email,
          fullDetails.patient.email
        );

        await sendAppointmentStatusUpdateEmail(
          appointmentDetails.patientEmail,
          {
            ...appointmentDetails,
            meetLink: meetLink || "",
          }
        );
      }

      if (status === "CANCELLED") {
        await sendAppointmentStatusUpdateEmail(
          appointmentDetails.patientEmail,
          {
            ...appointmentDetails,
            meetLink: "", // no meet link for cancellation
          }
        );
      }
    }

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
