import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

const sendBanEmail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      subject: "Account Update: Temporary Suspension",
      to: [{ email: options.email, name: options.name }],
      sender: { email: process.env.SMTP_USER, name: "Security Team" },
      htmlContent: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="background-color: #111827; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Security Notice</h1>
            </div>
            <div style="padding: 40px; color: #374151; line-height: 1.6;">
              <p style="font-size: 18px;">Hello <strong>${options.name}</strong>,</p>
              <p>This email is to notify you that your account access has been restricted.</p>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-weight: 600;">Status: Temporarily Banned</p>
                <p style="margin: 8px 0 0; color: #b91c1c;">Access will be restored on: ${new Date(options.expiry).toLocaleDateString()}</p>
                <p style="margin: 8px 0 0; color: #b91c1c;">Reason: ${new Date(options.reason).toLocaleDateString()}</p>
              </div>
              <p style="font-size: 14px; color: #6b7280;">If you have questions regarding this action, please reply to this email to speak with our security team.</p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} Your E-Commerce Store</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully via API");
    return result;
  } catch (error) {
    console.error(
      "Brevo API Error Detail:",
      error.response?.body || error.message,
    );
    throw error;
  }
};

export default sendBanEmail;
