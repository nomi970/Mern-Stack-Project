import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { sendResetOtpEmail } from "../utils/email.js";

const createToken = (userId) => {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

const mapUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "Email already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword
  });

  return { token: createToken(user._id.toString()), user: mapUser(user) };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return { token: createToken(user._id.toString()), user: mapUser(user) };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "User session is invalid.");
  }
  return mapUser(user);
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return { message: "If an account exists for this email, an OTP has been sent." };
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  user.resetOtp = otpHash;
  user.resetOtpExpiry = expiresAt;
  user.resetOtpAttempts = 0;
  await user.save();

  await sendResetOtpEmail({
    to: normalizedEmail,
    otp,
    expiresMinutes: env.otpExpiresMinutes
  });

  return { message: "If an account exists for this email, an OTP has been sent." };
};

export const verifyPasswordResetOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !user.resetOtp || !user.resetOtpExpiry) {
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  if (user.resetOtpExpiry.getTime() < Date.now()) {
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    user.resetOtpAttempts = 0;
    await user.save();
    throw new ApiError(400, "OTP has expired.");
  }

  if (user.resetOtpAttempts >= 5) {
    throw new ApiError(429, "Too many invalid attempts. Please request a new OTP.");
  }

  const incomingOtpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
  if (incomingOtpHash !== user.resetOtp) {
    user.resetOtpAttempts += 1;
    await user.save();
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  user.resetOtp = null;
  user.resetOtpExpiry = null;
  user.resetOtpAttempts = 0;
  await user.save();

  const resetToken = jwt.sign(
    {
      sub: user._id.toString(),
      purpose: "password-reset"
    },
    env.jwtSecret,
    { expiresIn: `${env.otpExpiresMinutes}m` }
  );

  return {
    message: "OTP verified successfully.",
    resetToken
  };
};

export const resetPassword = async ({ email, newPassword, resetToken }) => {
  if (!resetToken) {
    throw new ApiError(400, "resetToken is required.");
  }

  let payload;
  try {
    payload = jwt.verify(resetToken, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  if (payload.purpose !== "password-reset") {
    throw new ApiError(400, "Invalid reset token purpose.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (payload.sub !== user._id.toString()) {
    throw new ApiError(400, "Reset token does not match this user.");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.resetOtp = null;
  user.resetOtpExpiry = null;
  user.resetOtpAttempts = 0;
  await user.save();

  return { message: "Password reset successful." };
};
