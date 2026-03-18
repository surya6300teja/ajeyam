const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Send a password-reset email with a branded HTML template.
 */
exports.sendPasswordResetEmail = async (toEmail, resetURL) => {
    const transporter = createTransporter();

    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background:#f9f5f0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f0;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#78350f,#c2410c);padding:32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">ajeyam.in</h1>
                <p style="margin:8px 0 0;color:#fed7aa;font-size:13px;letter-spacing:1px;">WHERE HISTORY COMES ALIVE</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 32px;">
                <h2 style="margin:0 0 16px;color:#78350f;font-size:22px;">Reset Your Password</h2>
                <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                  We received a request to reset your password. Click the button below to choose a new one. This link is valid for <strong>10 minutes</strong>.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${resetURL}" target="_blank"
                        style="display:inline-block;background:#78350f;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:28px 0 0;color:#888;font-size:13px;line-height:1.5;">
                  If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                </p>
                <hr style="border:none;border-top:1px solid #f0e7dc;margin:28px 0;" />
                <p style="margin:0;color:#aaa;font-size:12px;">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <a href="${resetURL}" style="color:#c2410c;word-break:break-all;">${resetURL}</a>
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#fef3c7;padding:20px 32px;text-align:center;">
                <p style="margin:0;color:#92400e;font-size:12px;">&copy; ${new Date().getFullYear()} ajeyam.in — All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;

    await transporter.sendMail({
        from: `"Ajeyam" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your password — ajeyam.in',
        html,
    });
};
