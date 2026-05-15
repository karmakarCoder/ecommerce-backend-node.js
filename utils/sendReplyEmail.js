import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

const sendReplyEmail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      subject: `Admin replied to your review of ${options.productName}`,
      to: [{ email: options.email, name: options.name }],
      sender: { email: process.env.SMTP_USER, name: "Store Support" },
      htmlContent: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color: #111827; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Review Response</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px; color: #374151; line-height: 1.6;">
              <p style="font-size: 18px;">Hi <strong>${options.name}</strong>,</p>
              <p>An administrator has responded to your review for <strong>${options.productName}</strong>:</p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #111827; padding: 20px; margin: 30px 0; border-radius: 4px; font-style: italic;">
                <p style="margin: 0; color: #1f2937;">"${options.reply}"</p>
              </div>

              <p style="font-size: 14px; color: #6b7280;">
                We appreciate you taking the time to share your experience with us.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} Your E-Commerce Store
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`Review reply email sent to ${options.email}`);
    return result;
  } catch (error) {
    console.error(
      "Brevo Reply Email Error:",
      error.response?.body || error.message,
    );
    throw error;
  }
};

export default sendReplyEmail;
