
export interface Appointment {
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    appointmentTime: Date;
    status: string;
    doctorName: string;
    doctorSpecialization: string;
    doctorEmail: string;
    consultationFee:number,
    meetLink?:string
  }

export const patientAppointmentPendingTemplate = (appointmentDetails: Appointment) => {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Request Received</title>
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
            color: #ca8a04;
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
            <h2 class="title">Appointment Request Received</h2>
          </div>
          <p class="text">
            Dear ${appointmentDetails.patientName},
          </p>
          <p class="text">
            We've received your appointment request with <strong>Dr. ${appointmentDetails.doctorName}</strong>. It is currently <strong>pending confirmation from the doctor</strong>.
          </p>
          <p class="text">
            <strong>Appointment Details:</strong><br />
            <strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}<br />
            <strong>Specialization:</strong> ${appointmentDetails.doctorSpecialization}<br />
            <strong>Consultation Fee:</strong> Rs.${appointmentDetails.consultationFee}<br />
            <strong>Requested Time:</strong> ${new Date(appointmentDetails.appointmentTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}<br />
          </p>
          <div style="text-align:center;">
            <a href="https://app.swastify.life/doctor/appointments" class="button">Check Status</a>
          </div>
          <p class="text">
            You will receive a confirmation once the doctor accepts your request. Thank you for choosing Swastify.
          </p>
          <div class="footer">
            © ${new Date().getFullYear()} Swastify • Made with 💚
          </div>
        </div>
      </body>
    </html>`;
  };

export const doctorAppointmentPendingTemplate = (appointmentDetails: Appointment) => {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Appointment Request</title>
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
            color: #0e7490;
            font-size: 24px;
            margin: 16px 0;
          }
          .text {
            font-size: 16px;
            line-height: 1.5;
          }
          .button {
            display: inline-block;
            background: #0e7490;
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
            <h2 class="title">New Appointment Request</h2>
          </div>
          <p class="text">
            Dear Dr. ${appointmentDetails.doctorName},
          </p>
          <p class="text">
            A new appointment has been requested by <strong>${appointmentDetails.patientName}</strong>. Please review and confirm or decline the request at your earliest convenience.
          </p>
          <p class="text">
            <strong>Appointment Details:</strong><br />
            <strong>Patient:</strong> ${appointmentDetails.patientName}<br />
            <strong>Email:</strong> ${appointmentDetails.patientEmail}<br />
            <strong>Requested Time:</strong> ${new Date(appointmentDetails.appointmentTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}<br />
            <strong>Consultation Fee:</strong> Rs.${appointmentDetails.consultationFee}<br />
          </p>
          <div style="text-align:center;">
            <a href="https://app.swastify.life/doctor/appointments" class="button">Review Appointment</a>
          </div>
          <p class="text">
            Kindly take action on this request at your convenience to keep your schedule up to date.
          </p>
          <div class="footer">
            © ${new Date().getFullYear()} Swastify • Thank you for being with us 🙌
          </div>
        </div>
      </body>
    </html>`;
  };

export const patientAppointmentStatusUpdateTemplate = (appointmentDetails: Appointment) => {
    const statusTextMap: Record<string, string> = {
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      PENDING: 'pending',
    };

  
    const status = appointmentDetails.status || 'PENDING';
    const statusText = statusTextMap[status];
  
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Appointment Status Update</title>
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
            color: #2563eb;
            font-size: 24px;
            margin: 16px 0;
          }
          .text {
            font-size: 16px;
            line-height: 1.5;
          }
          .highlight {
            font-weight: bold;
            color: #047857;
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
            <h2 class="title">Appointment Status: ${statusText.toUpperCase()}</h2>
          </div>
          <p class="text">
            Dear ${appointmentDetails.patientName},
          </p>
          <p class="text">
            Your appointment with <strong>Dr. ${appointmentDetails.doctorName}</strong> has been <span class="highlight">${statusText}</span>.
          </p>
          < class="text">
            <strong>Appointment Details:</strong><br />
            <strong>Doctor:</strong> Dr. ${appointmentDetails.doctorName}<br />
            <strong>Specialization:</strong> ${appointmentDetails.doctorSpecialization}<br />
            <strong>Consultation Fee:</strong> Rs.${appointmentDetails.consultationFee}<br />
            <strong>Date & Time:</strong> ${new Date(appointmentDetails.appointmentTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}<br />
            <strong>Current Status:</strong> ${statusText.toUpperCase()}<br />
            ${appointmentDetails.meetLink ? `<strong>Meet Link:</strong> ${appointmentDetails.meetLink}<br />` : ""}
          </p>
          <p class="text">
            You can track this appointment in your dashboard:
          </p>
          <div style="text-align:center;">
            <a href="https://app.swastify.life/patient/appointments" class="button">View Appointment</a>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Swastify • Stay healthy, stay happy 💚
          </div>
        </div>
      </body>
    </html>`;
  };