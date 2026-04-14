import { connectDb } from "../lib/db.js";
import { env } from "../lib/env.js";
import { generateResetToken } from "../lib/authUtils.js";
import User from "../lib/userModel.js";
import { sendError, sendSuccess } from "../lib/response.js";

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
      return sendSuccess(res, 200, "If an account exists, reset instructions were generated.");
    }

    const { rawToken, hashedToken } = generateResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);
    await user.save();

    return sendSuccess(res, 200, "If an account exists, reset instructions were generated.", {
      resetToken: process.env.NODE_ENV === "development" ? rawToken : undefined
    });
  } catch (error) {
    return sendError(res, 500, "Failed to process request.", error.message);
  }
}
