import { EmailClient, EmailMessage, EmailContent } from '@azure/communication-email';

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '';
const senderEmail = 'donotreply@swastify.life'; 
const emailClient = new EmailClient(connectionString);

const sendOtpEmail = async (email: string, otp: string) => {
  const emailContent: EmailContent = {
    subject: 'Your OTP for Registration',
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Swastify OTP Verification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: 'Segoe UI', sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #047857;
        padding: 24px;
        text-align: center;
        color: white;
      }
      .logo {
        max-width: 120px;
        margin-bottom: 10px;
      }
      .content {
        padding: 32px 24px;
        text-align: center;
      }
      .otp-box {
        display: inline-block;
        background-color: #e6f4ea;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 24px;
        letter-spacing: 8px;
        color: #047857;
        font-weight: bold;
        margin: 24px 0;
      }
      .footer {
        background-color: #f4f4f4;
        padding: 20px;
        font-size: 12px;
        color: #888888;
        text-align: center;
      }
      @media only screen and (max-width: 600px) {
        .otp-box {
          font-size: 20px;
          letter-spacing: 6px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img class="logo" src="https://www.swastify.life/images/swastify-logo.png" alt="Swastify Logo" />
        <h2>Swastify OTP Verification</h2>
      </div>
      <div class="content">
        <p>Hey there 👋,</p>
        <p>To keep things secure, please use the OTP below to complete your action.</p>

        <div class="otp-box">
          ${otp}
        </div>

        <p>This OTP is valid for the next 10 minutes. Don’t share it with anyone. If you didn’t request this, just ignore this email.</p>

        <p>Stay safe and healthy,<br />💚 Team Swastify</p>
      </div>
      <div class="footer">
        © 2025 Swastify. All rights reserved.<br />
        Made with 💚 for better healthcare.
      </div>
    </div>
  </body>
</html>`,
  };

  const emailMessage: EmailMessage = {
    senderAddress: senderEmail,
    content: emailContent,
    recipients: {
      to: [
        {
          address: email,
          displayName: 'Swastify User',
        },
      ],
    },
  };

  try {
    const poller = await emailClient.beginSend(emailMessage);
    const response = await poller.pollUntilDone();
    console.log('Email send request sent! Response:', response);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Error sending OTP');
  }
};

export default sendOtpEmail;