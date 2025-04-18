export const resetPasswordTemplate = (resetLink: string) => {
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Swastify Password Reset</title>
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
        .reset-link {
          display: inline-block;
          background-color: #047857;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 18px;
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
          .reset-link {
            font-size: 16px;
          }
        }

        a{
            color:white;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img class="logo" src="https://www.swastify.life/images/swastify-logo.png" alt="Swastify Logo" />
          <h2>Swastify Password Reset</h2>
        </div>
        <div class="content">
          <p>Hey there 👋,</p>
          <p>We received a request to reset your password. To proceed, click the button below:</p>
  
          <a class="reset-link" href="${resetLink}">Reset Your Password</a>
  
          <p>If you didn’t request this, please ignore this email. If you have any concerns, feel free to reach out to us.</p>
  
          <p>This link will expire in 10 minutes.</p>
  
          <p>Stay safe and healthy,<br />💚 Team Swastify</p>
        </div>
        <div class="footer">
          © 2025 Swastify. All rights reserved.<br />
          Made with 💚 for better healthcare.
        </div>
      </div>
    </body>
  </html>`
  };
  