export const resetPasswordTemplate = (resetLink: string) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Password</title>
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
          <h2 class="title">Reset Your Password</h2>
        </div>
        <p class="text">
          We received a request to reset your Swastify password. Click the button below to proceed.
        </p>
        <div style="text-align:center;">
          <a href="${resetLink}" class="button" style="color: #ffffff; background: #047857; text-decoration: none; border-radius: 6px; padding: 12px 24px; display: inline-block;">Reset Password</a>
        </div>
        <p class="text">
          This link expires in 10 minutes. If you didn’t request this, you can safely ignore this email.
        </p>
        <div class="footer">
          © ${new Date().getFullYear()} Swastify • Made with 💚
        </div>
      </div>
    </body>
  </html>`;
};
