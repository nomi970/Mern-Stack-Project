import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export const signJwt = (userId) => {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const verifyJwt = (token) => jwt.verify(token, env.jwtSecret);

export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const validatePasswordStrength = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongPasswordRegex.test(password);
};

export const mapUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});
