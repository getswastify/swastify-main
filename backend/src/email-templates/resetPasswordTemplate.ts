export const resetPasswordTemplate = (resetLink: string) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Swastify Password</title>
      <style>
        /* Base styles */
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333333;
          line-height: 1.6;
        }
        
        /* Container */
        .container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          background-color: #ffffff;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        
        /* Header */
        .header {
          padding: 24px;
          background-color: #e6f4ea;
          border-bottom: 1px solid #d0e8d8;
          text-align: center;
        }
        
        .logo-container {
          display: inline-block;
          text-align: center;
        }
        
        .logo {
          height: 40px;
          margin-right: 12px;
          vertical-align: middle;
        }
        
        .brand-name {
          font-size: 24px;
          font-weight: 600;
          color: #047857;
          vertical-align: middle;
        }
        
        /* Content */
        .content {
          padding: 40px 5%;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #047857;
        }
        
        .message {
          margin-bottom: 32px;
          font-size: 16px;
          color: #555555;
          text-align: left;
        }
        
        .reset-button {
          display: inline-block;
          background-color: #047857;
          color: #ffffff;
          font-weight: 600;
          font-size: 16px;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          margin: 24px 0;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background-color: #036c4e;
        }
        
        .expiry-note {
          font-size: 14px;
          color: #666666;
          margin: 24px 0;
          padding: 16px;
          background-color: #f8f8f8;
          border-radius: 8px;
          border-left: 4px solid #047857;
          text-align: left;
        }
        
        .divider {
          height: 1px;
          background-color: #e0e0e0;
          margin: 32px 0;
        }
        
        /* Footer */
        .footer {
          background-color: #f8f8f8;
          padding: 32px 5%;
          text-align: center;
          font-size: 14px;
          color: #666666;
          border-top: 1px solid #e0e0e0;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 10px;
          padding: 8px 16px;
          background-color: #f0f0f0;
          border-radius: 4px;
          color: #047857;
          text-decoration: none;
          font-weight: 500;
        }
        
        .social-link:hover {
          background-color: #e0e0e0;
        }
        
        .footer-links {
          margin: 20px 0;
        }
        
        .footer-link {
          color: #047857;
          text-decoration: none;
          margin: 0 12px;
        }
        
        .footer-link:hover {
          text-decoration: underline;
        }
        
        .tagline {
          color: #047857;
          margin-top: 16px;
          font-style: italic;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .content {
            padding: 24px 16px;
          }
          
          .reset-button {
            padding: 12px 24px;
            font-size: 15px;
            width: 80%;
          }
          
          .footer-links {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .footer-link {
            margin: 4px 0;
          }
          
          .social-links {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          
          .social-link {
            margin: 4px 0;
            width: 80%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img class="logo" src="https://www.swastify.life/images/swastify-logo.png" alt="Swastify Logo" />
            <span class="brand-name">Swastify</span>
          </div>
        </div>

        <div class="content">
          <h1 class="title">Reset Your Password</h1>
          
          <div class="message">
            <p>Hello,</p>
            <p>We received a request to reset your password for your Swastify account. To proceed with resetting your password, please click the button below.</p>
          </div>

          <a href="${resetLink}" class="reset-button">Reset Password</a>
          
          <div class="expiry-note">
            <p><strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
          </div>
          
          <div class="divider"></div>
          
          <p>Thank you for being part of our journey to improve healthcare experiences.</p>
          <p>— The Swastify Team</p>
        </div>

        <div class="footer">
          <div class="social-links">
            <a href="https://x.com/getswastify" class="social-link">Follow on X</a>
            <a href="https://www.linkedin.com/company/getswastify/" class="social-link">Connect on LinkedIn</a>
          </div>
          
          <div class="footer-links">
            <a href="http://swastify.life/privacy-policy" class="footer-link">Privacy Policy</a>
            <a href="http://swastify.life/terms-of-service" class="footer-link">Terms of Service</a>
            <a href="http://swastify.life/contact" class="footer-link">Contact Us</a>
          </div>
          
          <p>© ${new Date().getFullYear()} Swastify. All rights reserved.</p>
          <p class="tagline">Made with 💚 for better healthcare.</p>
        </div>
      </div>
    </body>
  </html>`;
};