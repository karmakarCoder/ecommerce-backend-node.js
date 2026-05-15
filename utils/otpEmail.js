import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

const sendOtpEmail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      subject: `${options.otp} is your verification code`,
      to: [{ email: options.email, name: options.name }],
      sender: { email: process.env.SMTP_USER, name: "Auth System" },
      htmlContent: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f9; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            
            <div style="background-color: #111827; padding: 25px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Verify Your Identity</h1>
            </div>

            <div style="padding: 40px; color: #374151; line-height: 1.6; text-align: center;">
              <p style="font-size: 16px; text-align: left;">Hello <strong>${options.name}</strong>,</p>
              <p style="text-align: left;">To finish setting up your account, please use the verification code below. This code is valid for <strong>10 minutes</strong>.</p>
              
              <div style="background-color: #f3f4f6; border: 1px dashed #d1d5db; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111827;">
                  ${options.otp}
                </span>
              </div>

              <div style="margin-bottom: 25px; padding: 10px; background-color: #fffbeb; border-radius: 6px; display: inline-block; width: 100%;">
                 <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                   ⏱️ This code will expire in ${options.otp_expiry} minutes.
                 </p>
              </div>

              <p style="font-size: 13px; color: #6b7280;">
                If you did not request this code, you can safely ignore this email. Your account security has not been compromised.
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                This is an automated message from the Security Team at Your E-Commerce Store.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`OTP Email successfully sent to ${options.email}`);
    return result;
  } catch (error) {
    console.error(
      "Brevo OTP Error Detail:",
      error.response?.body || error.message,
    );
    throw error;
  }
};

export default sendOtpEmail;
