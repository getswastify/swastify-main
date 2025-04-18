export const otpEmailTemplate =  (otp: string) => {
    
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Swastify OTP Verification</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #f4f7ff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        font-size: 14px;
        color: #434343;
      "
    >
    <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="vertical-align: middle;">
              <!-- Logo + Title -->
              <td style="display: flex; align-items: center;">
                <img
                  alt="Swastify Logo"
                  src="https://www.swastify.life/images/swastify-logo.png"
                  height="30px"
                  style="vertical-align: middle;"
                />
                <span
                  style="font-size: 18px; font-weight: 600; color: #047857; margin-left: 10px;"
                >
                  Swastify
                </span>
              </td>
      
              <!-- Date on the right -->
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #047857;"
                >
                  ${new Date().toLocaleDateString()}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </header>
      
      

      <main>
        <div
          style="
            margin: 0;
            margin-top: 40px;
            padding: 32px 24px;
            background: #ffffff;
            border-radius: 8px;
            text-align: center;
          "
        >
          <h1
            style="
              margin: 0;
              font-size: 24px;
              font-weight: 500;
              color: #1f1f1f;
            "
          >
            Your OTP Verification Code
          </h1>
          <p
            style="
              margin: 0;
              margin-top: 17px;
              font-size: 16px;
              font-weight: 500;
            "
          >
            Hey there 👋,
          </p>
          <p
            style="
              margin: 0;
              margin-top: 17px;
              font-weight: 500;
              letter-spacing: 0.56px;
            "
          >
            To keep your account secure, use the OTP below to complete the procedure. The OTP is valid for
            <span style="font-weight: 600; color: #047857;">10 minutes</span>.
            Please do not share this code with anyone, including Swastify staff.
          </p>

          <div
            style="
              margin-top: 30px;
              font-size: 40px;
              font-weight: bold;
              letter-spacing: 10px;
              color: #047857;
              background-color: #e6f4ea;
              padding: 16px 32px;
              border-radius: 12px;
              display: inline-block;
            "
          >
            ${otp}
          </div>

          <p
            style="margin-top: 30px; font-size: 16px; color: #888888; font-weight: 500;"
          >
            This OTP is valid for the next 10 minutes. If you didn’t request this, feel free to ignore this email.
          </p>

          <p
            style="margin-top: 30px; font-size: 16px; color: #8c8c8c;"
          >
            Stay safe and healthy, <br />💚 Team Swastify
          </p>
        </div>
      </main>

      <footer
        style="
          width: 100%;
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p style="margin: 0;">© 2025 Swastify. All rights reserved.</p>
        <p style="margin-top: 8px;">
          Made with 💚 for better healthcare.
        </p>
      </footer>
    </div>
  </body>
</html>
`
}