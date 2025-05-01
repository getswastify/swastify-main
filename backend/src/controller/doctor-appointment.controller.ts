import { Request, Response } from 'express';
import { prisma } from '../utils/prismaConnection';

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
