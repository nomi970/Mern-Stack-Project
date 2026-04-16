import nodemailer from "nodemailer";
import { connectDb } from "../lib/db.js";
import { env } from "../lib/env.js";
import { generateResetToken } from "../lib/authUtils.js";
import User from "../lib/userModel.js";
import { sendError, sendSuccess } from "../lib/response.js";

const sendResetEmail = async (toEmail, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass
    }
  });

  await transporter.sendMail({
    from: `"Items Manager" <${env.emailUser}>`,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#1e293b;">Reset Your Password</h2>
        <p style="color:#475569;">Click the button below to reset your password. This link expires in ${env.resetTokenExpiresMinutes} minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    await connectDb();
    const { email } = req.body || {};

    if (!email) {
      return sendError(res, 400, "Email is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendSuccess(res, 200, "If an account exists, reset instructions were sent.");
    }

    const { rawToken, hashedToken } = generateResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
    await sendResetEmail(normalizedEmail, resetUrl);

    return sendSuccess(res, 200, "If an account exists, reset instructions were sent.");
  } catch (error) {
    return sendError(res, 500, "Failed to process request.", error.message);
  }
}
