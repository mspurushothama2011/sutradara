import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER || 'houseofsutradara@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.smpt || 'pjpn zvdh wblt bill';
const SMTP_FROM = process.env.SMTP_FROM || `Sutradara Luxury Handlooms <${SMTP_USER}>`;

// Create reusable Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS.replace(/\s+/g, ''), // Strip spaces in App Password
  },
});

/**
 * Sends a luxury styled OTP verification email to a patron.
 */
export async function sendOtpEmail(toEmail: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sutradara Login Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A130D;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid rgba(179, 137, 56, 0.25); overflow: hidden; box-shadow: 0 8px 30px rgba(45, 25, 8, 0.06);">
          
          <!-- Header Branding Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A130D 0%, #2D2218 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #B38938;">
              <div style="font-size: 24px; font-weight: 700; letter-spacing: 0.18em; color: #FAF8F5; text-transform: uppercase;">
                SUTRA<span style="color: #B38938;">ಧಾರ</span>
              </div>
              <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.28em; color: #B38938; text-transform: uppercase; margin-top: 4px;">
                Authentic Handloom Sarees
              </div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; color: #B38938; text-transform: uppercase; margin-bottom: 8px;">
                Patron Authentication
              </div>
              <h1 style="font-size: 20px; font-weight: 700; color: #1A130D; margin: 0 0 16px 0; line-height: 1.4;">
                Your Secure Login Verification Code
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5C4B3C; margin: 0 0 24px 0;">
                Greetings from Sutradara. Use the 6-digit verification code below to access your luxury saree vault, order history, and heirloom acquisitions.
              </p>

              <!-- Luxury OTP Code Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(180deg, #FAF8F5 0%, #F5F0E6 100%); border: 1.5px dashed #B38938; border-radius: 8px; padding: 20px 24px;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #8A6418; text-transform: uppercase; margin-bottom: 6px;">
                      ONE-TIME PASSCODE
                    </div>
                    <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.35em; color: #1A130D; font-family: 'Courier New', Courier, monospace; padding-left: 0.35em;">
                      ${otp}
                    </div>
                    <div style="font-size: 12px; color: #8C6A3E; margin-top: 8px; font-weight: 500;">
                      ⏳ Valid for 10 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #786454; margin: 20px 0 0 0;">
                If you did not request this verification code, please disregard this email. Your account remains completely secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF8F5; padding: 20px 32px; text-align: center; border-top: 1px solid rgba(179, 137, 56, 0.15);">
              <p style="font-size: 11px; color: #8C7866; margin: 0 0 4px 0;">
                Sutradara Handloom Saree Curations &bull; Varanasi &bull; Kanchipuram &bull; Yeola
              </p>
              <p style="font-size: 10px; color: #A69685; margin: 0;">
                Silk Mark Certified &bull; High-Assurance Doorstep Logistics
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: toEmail,
      subject: `👑 ${otp} is your Sutradara Login Verification Code`,
      text: `Your Sutradara verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      html: htmlContent,
    });

    console.log(`✅ [SMTP SUCCESS] OTP email delivered to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ [SMTP ERROR] Failed to send email to ${toEmail}:`, error?.message || error);
    return { success: false, error: error?.message || 'SMTP transmission error' };
  }
}

/**
 * Sends an Account Deletion confirmation OTP email.
 */
export async function sendAccountDeletionOtpEmail(toEmail: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirm Sutradara Account Deletion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1A130D;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid rgba(220, 38, 38, 0.3); overflow: hidden;">
          <tr>
            <td style="background: #991B1B; padding: 24px; text-align: center; color: #FFFFFF;">
              <h2 style="margin: 0; font-size: 18px; letter-spacing: 0.1em; text-transform: uppercase;">Account Deactivation Request</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 14px; color: #5C4B3C; line-height: 1.6;">
                You have requested to deactivate your Sutradara customer account and anonymize your personal data.
              </p>
              <div style="background: #FEF2F2; border: 1.5px dashed #EF4444; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #991B1B; letter-spacing: 0.15em;">CONFIRMATION CODE</div>
                <div style="font-size: 32px; font-weight: 800; color: #991B1B; letter-spacing: 0.3em; font-family: monospace; margin: 8px 0;">${otp}</div>
                <div style="font-size: 12px; color: #B91C1C;">Valid for 10 minutes</div>
              </div>
              <p style="font-size: 12px; color: #786454;">If you did not initiate this request, please contact houseofsutradara@gmail.com immediately.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: toEmail,
      subject: `⚠️ ${otp} is your Sutradara Account Deletion Confirmation Code`,
      text: `Your Sutradara account deletion verification code is ${otp}. Valid for 10 minutes.`,
      html: htmlContent,
    });
    console.log(`✅ [SMTP SUCCESS] Deletion OTP sent to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ [SMTP ERROR] Failed to send deletion OTP to ${toEmail}:`, error);
    return { success: false, error: error?.message || 'SMTP transmission error' };
  }
}
