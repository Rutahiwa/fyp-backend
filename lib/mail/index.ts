import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");
const FROM_EMAIL = "noreply@udsm.ac.tz"; // Update to verified domain

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });
    return { success: true, data };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendOtpEmail(to: string, otpCode: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Password Reset OTP</h2>
      <p>Your one-time password for password reset is: <strong>${otpCode}</strong></p>
      <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
    </div>
  `;
  return await sendEmail({ to, subject: "UDSM Platform - Password Reset OTP", html });
}
