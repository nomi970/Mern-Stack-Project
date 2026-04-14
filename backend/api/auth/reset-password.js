import { connectDb } from "../lib/db.js";
import { hashPassword, hashToken, validatePasswordStrength } from "../lib/authUtils.js";
import User from "../lib/userModel.js";
import { sendError, sendSuccess } from "../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    await connectDb();
    const { token, password, newPassword } = req.body || {};

    if (!token || !password || !newPassword) {
      return sendError(res, 400, "Token, password, and newPassword are required.");
    }
    if (password !== newPassword) {
      return sendError(res, 400, "Password and newPassword must match.");
    }
    if (!validatePasswordStrength(newPassword)) {
      return sendError(
        res,
        400,
        "New password must be at least 8 characters and include uppercase, lowercase, and number."
      );
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return sendError(res, 400, "Invalid or expired reset token.");
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return sendSuccess(res, 200, "Password reset successful.");
  } catch (error) {
    return sendError(res, 500, "Failed to reset password.", error.message);
  }
}
