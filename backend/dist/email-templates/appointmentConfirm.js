"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentConfirmationTemplate = void 0;
const appointmentConfirmationTemplate = (appointmentDetails) => {
    console.log(appointmentDetails.appointmentTime);
    console.log(appointmentDetails.consultationFee);
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Confirmation</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            padding: 32px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo {
            height: 40px;
          }
          .title {
            color: #047857;
            font-size: 24px;
            margin: 16px 0;
          }
          .text {
            font-size: 16px;
            line-height: 1.5;
          }
          .button {
            display: inline-block;
            background: #047857;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 24px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #777;
            margin-top: 32px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.swastify.life/images/swastify-logo.png" class="logo" alt="Swastify" />
            <h2 class="title">Your Appointment Has Been Confirmed!</h2>
          </div>
          <p class="text">
            Dear ${appointmentDetails.patientName},
          </p>
          <p class="text">
            Your appointment with Dr. ${appointmentDetails.doctorName} has been successfully confirmed.
          </p>
          <p class="text">
            <strong>Appointment Details:</strong><br />
            <strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName} <br />
            <strong>Specialization:</strong> ${appointmentDetails.doctorSpecialization}<br />
            <strong>Consultation Fee:</strong> $${appointmentDetails.consultationFee}<br />
          <strong>Appointment Time:</strong> ${new Date(appointmentDetails.appointmentTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}<br />

          </p>
          <div style="text-align:center;">
            <a href="https://www.swastify.life/appointments" class="button" style="color: #ffffff; background: #047857; text-decoration: none; border-radius: 6px; padding: 12px 24px; display: inline-block;">View Appointment</a>
          </div>
          <p class="text">
            If you need to reschedule or cancel your appointment, please visit the above link.
          </p>
          <p class="text">
            We look forward to seeing you soon!
          </p>
          <div class="footer">
            © ${new Date().getFullYear()} Swastify • Made with 💚
          </div>
        </div>
      </body>
    </html>`;
};
exports.appointmentConfirmationTemplate = appointmentConfirmationTemplate;
