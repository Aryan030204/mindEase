import nodemailer from "nodemailer";

const createTransporter = () => {
  const gmailId = process.env.GMAIL_ID;
  const gmailPassword = process.env.GMAIL_PASSWORD;

  if (!gmailId || !gmailPassword) {
    throw new Error("GMAIL_ID and GMAIL_PASSWORD must be configured in environment variables");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailId,
      pass: gmailPassword,
    },
  });
};

export const sendPasswordResetOtpEmail = async ({
  to,
  firstName,
  otp,
  expiresInMinutes = 5,
}) => {
  const transporter = createTransporter();
  const subject = "MindEase | Your 6 digit code to recover your password";

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 24px; color: #1f2937;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #ffffff;">
          <div style="display: inline-flex; align-items: center; gap: 10px;">
            <span style="display: inline-flex; width: 36px; height: 36px; border-radius: 9999px; background: rgba(255, 255, 255, 0.2); align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="MindEase logo">
                <path d="M12 21s-7-4.438-7-11a4 4 0 0 1 7-2.645A4 4 0 0 1 19 10c0 6.562-7 11-7 11z"></path>
              </svg>
            </span>
            <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">MindEase</span>
          </div>
          <p style="margin: 12px 0 0; font-size: 14px; opacity: 0.95;">Your 6 digit code to recover your password</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="margin: 0 0 10px; font-size: 20px; color: #111827;">MindEase Password Recovery</h2>
          <p style="margin: 0 0 16px; line-height: 1.6;">
            Hi ${firstName || "there"}, we received a request to reset your MindEase account password.
          </p>

          <p style="margin: 0 0 10px; color: #374151;">Use this MindEase verification code:</p>
          <div style="display: inline-block; font-size: 30px; letter-spacing: 10px; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 14px 20px; border-radius: 10px; border: 1px dashed #0ea5e9;">
            ${otp}
          </div>

          <p style="margin: 16px 0 0; color: #4b5563; line-height: 1.6;">
            This MindEase OTP expires in ${expiresInMinutes} minutes. You can request a new code after 5 minutes.
          </p>
          <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
            If you did not request this, you can safely ignore this email. Your MindEase account remains secure.
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    "MindEase Password Recovery",
    "",
    `Hi ${firstName || "there"},`,
    "",
    "Your MindEase 6 digit code to recover your password is:",
    otp,
    "",
    `This code expires in ${expiresInMinutes} minutes and a new code can be generated after 5 minutes.`,
    "",
    "If you did not request this, please ignore this email.",
  ].join("\n");

  await transporter.sendMail({
    from: `"MindEase" <${process.env.GMAIL_ID}>`,
    to,
    subject,
    html,
    text,
  });
};
