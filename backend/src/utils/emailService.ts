import nodemailer from 'nodemailer';
import { SESClient } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: 'ap-south-1',  // Update with your AWS SES region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',  // Ensure it's a string
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',  // Ensure it's a string
  },
});

// Create a nodemailer transporter using SES
const transporter = nodemailer.createTransport({
  SES: { ses: sesClient, aws: require('@aws-sdk/client-ses') },
});

const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: 'no-reply@swastify.life',  // Replace with your verified SES email or domain
    to: email,
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
        <!-- Replace src with your logo URL -->
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
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Error sending OTP');
  }
};

export default sendOtpEmail;
