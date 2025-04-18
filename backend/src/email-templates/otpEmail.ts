export const otpEmailTemplate = (otp: string) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Swastify OTP</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f4f4f4;
        font-family: 'Inter', sans-serif;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      }
      .header {
        background: #e6f4ea;
        padding: 20px;
        text-align: center;
      }
      .logo {
        height: 36px;
      }
      .brand {
        font-size: 20px;
        font-weight: 600;
        color: #047857;
        margin-left: 8px;
        vertical-align: middle;
      }
      .content {
        padding: 30px;
        text-align: center;
      }
      .title {
        font-size: 22px;
        color: #047857;
        margin-bottom: 16px;
      }
      .message {
        font-size: 15px;
        color: #555;
        margin-bottom: 24px;
      }
      .otp {
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 6px;
        background: #e6f4ea;
        display: inline-block;
        padding: 12px 24px;
        border-radius: 6px;
        color: #047857;
        margin-bottom: 16px;
      }
      .note {
        font-size: 13px;
        color: #777;
        margin-top: 16px;
      }
      .footer {
        background: #fafafa;
        text-align: center;
        font-size: 13px;
        color: #666;
        padding: 20px;
        border-top: 1px solid #eee;
      }
      .footer a {
        color: #047857;
        text-decoration: none;
        margin: 0 8px;
      }
      .footer a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://www.swastify.life/images/swastify-logo.png" alt="Swastify" class="logo" />
        <span class="brand">Swastify</span>
      </div>
      <div class="content">
        <h1 class="title">Your OTP Code</h1>
        <p class="message">Use the code below to verify your account:</p>
        <div class="otp">${otp}</div>
        <p class="note">This code expires in 10 minutes. If you didn’t request it, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Swastify</p>
        <p>
          <a href="https://x.com/getswastify">X</a> • 
          <a href="https://www.linkedin.com/company/getswastify/">LinkedIn</a> • 
          <a href="http://swastify.life/contact">Contact</a>
        </p>
        <p>Made with 💚 for better healthcare.</p>
      </div>
    </div>
  </body>
</html>`;
};