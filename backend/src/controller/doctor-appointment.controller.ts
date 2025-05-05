import { Request, Response } from 'express';
import { prisma } from '../utils/prismaConnection';
import { Appointment, sendAppointmentStatusUpdateEmail } from '../utils/emailConnection';

export const getDoctorAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId;

    if (!doctorId) {
      return res.status(400).json({
        status: false,
        message: 'Doctor ID is required.',
        error: 'Missing doctorId from request context.',
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
        message: 'No appointments found for this doctor.',
        error: 'No records available.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Doctor appointments fetched successfully.',
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
    console.error('Error fetching doctor appointments:', error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong while fetching the appointments.',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId;
    const { appointmentId, status } = req.body;

    if (!appointmentId || !status) {
      return res.status(400).json({
        status: false,
        message: 'appointmentId and status are required.',
        error: 'Missing fields in request body.',
      });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status.',
        error: 'Status must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED',
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to update this appointment.',
        error: 'Unauthorized access.',
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
      const appointmentDetails: Appointment = {
        patientName: `${fullDetails.patient.firstName} ${fullDetails.patient.lastName}`,
        patientEmail: fullDetails.patient.email,
        doctorName: `${fullDetails.doctor.user.firstName} ${fullDetails.doctor.user.lastName}`,
        doctorSpecialization: fullDetails.doctor.specialization,
        doctorEmail: fullDetails.doctor.user.email,
        consultationFee: fullDetails.doctor.consultationFee,
        appointmentTime: fullDetails.appointmentTime,
        status: fullDetails.status,
      };

      // 🔔 Send email to patient
      await sendAppointmentStatusUpdateEmail(appointmentDetails.patientEmail, appointmentDetails);
    }

    return res.status(200).json({
      status: true,
      message: 'Appointment status updated successfully.',
      data: {
        appointment: updatedAppointment,
      },
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong while updating the appointment status.',
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

