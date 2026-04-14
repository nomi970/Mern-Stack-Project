import { connectDb } from "../lib/db.js";
import User from "../lib/userModel.js";
import { hashPassword, mapUser, signJwt, validatePasswordStrength } from "../lib/authUtils.js";
import { sendError, sendSuccess } from "../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    await connectDb();
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required.");
    }
    if (!validatePasswordStrength(password)) {
      return sendError(
        res,
        400,
        "Password must be at least 8 characters and include uppercase, lowercase, and number."
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();
    const normalizedNameLower = normalizedName.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { nameLower: normalizedNameLower }]
    });

    if (existingUser) {
      return sendError(res, 409, "Email or name already exists.");
    }

    const user = await User.create({
      name: normalizedName,
      nameLower: normalizedNameLower,
      email: normalizedEmail,
      password: await hashPassword(password)
    });

    const token = signJwt(user._id.toString());
    return sendSuccess(res, 201, "Signup successful.", { token, user: mapUser(user) });
  } catch (error) {
    return sendError(res, 500, "Failed to signup.", error.message);
  }
}
