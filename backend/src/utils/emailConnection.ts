import { EmailClient, EmailMessage, EmailContent } from '@azure/communication-email';
import { otpEmailTemplate } from '../email-templates/otpEmail';
import { resetPasswordTemplate } from '../email-templates/resetPasswordTemplate';
import dotenv from 'dotenv'
import { appointmentConfirmationTemplate } from '../email-templates/appointmentConfirm';

dotenv.config();
const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '';
const senderEmail = 'donotreply@swastify.life'; 
const emailClient = new EmailClient(connectionString);

export interface Appointment {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentTime: Date;
  status: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorEmail: string;
  consultationFee?:number
}


export const sendOtpEmail = async (email: string, otp: string) => {
  const emailContent: EmailContent = {
    subject: 'Your OTP for Registration',
    html: otpEmailTemplate(otp),
  };

  const emailMessage: EmailMessage = {
    senderAddress: senderEmail,
    content: emailContent,
    recipients: {
      to: [{ address: email, displayName: 'Swastify User' }],
    },
  };

  try {
    const poller = await emailClient.beginSend(emailMessage);
    const operationState = poller.getOperationState() as { id: string };
    console.log('OTP email send initiated! Operation ID:', operationState.id);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Error sending OTP');
  }
};


export const sendResetPassEmail = async (email: string, resetLink: string) => {
  const emailContent: EmailContent = {
    subject: 'Password Reset Request',
    html: resetPasswordTemplate(resetLink),
  };

  const emailMessage: EmailMessage = {
    senderAddress: senderEmail,
    content: emailContent,
    recipients: {
      to: [{ address: email, displayName: 'Swastify User' }],
    },
  };

  try {
    const poller = await emailClient.beginSend(emailMessage);
    const operationState = poller.getOperationState() as { id: string };
    console.log('Password reset email send initiated! Operation ID:', operationState.id);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Error sending password reset email');
  }
};

export const sendAppointmentConfirmationEmail = async (email: string, appointmentDetails: Appointment) => {
  // Generate the email content based on the appointment details
  const emailContent: EmailContent = {
    subject: `Appointment Confirmation: ${appointmentDetails.appointmentTime}`,
    html: appointmentConfirmationTemplate(appointmentDetails),
  };

  // Prepare the email message with the content and recipient details
  const emailMessage: EmailMessage = {
    senderAddress: senderEmail, // Define your sender email address
    content: emailContent,
    recipients: {
      to: [{ address: email, displayName: `${appointmentDetails.patientName}` }],
    },
  };

  try {
    // Send the email using your email client (example: SendGrid, Mailgun, etc.)
    const poller = await emailClient.beginSend(emailMessage);
    const operationState = poller.getOperationState() as { id: string };

    // Log operation ID for debugging purposes
    console.log('Appointment confirmation email send initiated! Operation ID:', operationState.id);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw new Error('Error sending appointment confirmation email');
  }
};

