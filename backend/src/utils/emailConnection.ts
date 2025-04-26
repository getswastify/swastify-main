import { EmailClient, EmailMessage, EmailContent } from '@azure/communication-email';
import { otpEmailTemplate } from '../email-templates/otpEmail';
import { resetPasswordTemplate } from '../email-templates/resetPasswordTemplate';
import dotenv from 'dotenv'

dotenv.config();
const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '';
const senderEmail = 'donotreply@swastify.life'; 
const emailClient = new EmailClient(connectionString);


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


