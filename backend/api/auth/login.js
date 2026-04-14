import { connectDb } from "../lib/db.js";
import User from "../lib/userModel.js";
import { comparePassword, mapUser, signJwt } from "../lib/authUtils.js";
import { sendError, sendSuccess } from "../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    await connectDb();
    const { name, password } = req.body || {};

    if (!name || !password) {
      return sendError(res, 400, "Name and password are required.");
    }

    const user = await User.findOne({ nameLower: name.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 401, "Invalid name or password.");
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return sendError(res, 401, "Invalid name or password.");
    }

    const token = signJwt(user._id.toString());
    return sendSuccess(res, 200, "Login successful.", { token, user: mapUser(user) });
  } catch (error) {
    return sendError(res, 500, "Failed to login.", error.message);
  }
}
