import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const getTransporter = () => {
  if (!env.emailUser || !env.emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass
    }
  });
};

export const sendResetOtpEmail = async ({ to, otp, expiresMinutes }) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Items Manager Support" <${env.emailUser}>`,
    to,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}. It will expire in ${expiresMinutes} minutes.`,
    html: `<p>Your OTP is <strong>${otp}</strong>.</p><p>It will expire in ${expiresMinutes} minutes.</p>`
  });
};
