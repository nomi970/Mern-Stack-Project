import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

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
    return { message: "If an account exists for this email, a reset link has been sent." };
  }

  const rawResetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");
  const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawResetToken}`;
  return {
    message: "If an account exists for this email, a reset link has been sent.",
    resetUrl: env.nodeEnv === "development" ? resetUrl : undefined
  };
};

export const resetPassword = async ({ token, password }) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired.");
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return { message: "Password reset successful." };
};
