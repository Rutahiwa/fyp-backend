import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");
const FROM_EMAIL = "noreply@udsminfo.com";

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html
  });

  if (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
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
