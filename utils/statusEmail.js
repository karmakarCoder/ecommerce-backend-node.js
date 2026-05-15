import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

const sendStatusEmail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  // Logic for dynamic styling based on order status
  const isCancelled = options.status.toLowerCase() === "cancelled";
  const themeColor = isCancelled ? "#ef4444" : "#3b82f6";
  const bgColor = isCancelled ? "#fef2f2" : "#eff6ff";

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      subject: `Order Update: ${options.status}`,
      to: [{ email: options.email, name: options.name }],
      sender: { email: process.env.SMTP_USER, name: "Order Team" },
      htmlContent: `
        <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background-color: #111827; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Order Update</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px; color: #374151; line-height: 1.6;">
              <p style="font-size: 18px;">Hi <strong>${options.name}</strong>,</p>
              <p>The status of your order <strong>#${options.orderId}</strong> has been updated.</p>
              
              <div style="background-color: ${bgColor}; border-left: 4px solid ${themeColor}; padding: 20px; margin: 30px 0; border-radius: 4px; text-align: center;">
                <p style="margin: 0; color: ${themeColor}; font-weight: 700; font-size: 24px; text-transform: uppercase;">
                  ${options.status}
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280;">
                You can track your order details in your account dashboard. If you have any questions, simply reply to this email.
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

    console.log(`Order status email (${options.status}) sent successfully`);
    return result;
  } catch (error) {
    console.error(
      "Brevo Order Status API Error:",
      error.response?.body || error.message,
    );
    throw error;
  }
};

export default sendStatusEmail;
