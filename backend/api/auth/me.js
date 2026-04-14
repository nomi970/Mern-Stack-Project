import { connectDb } from "../lib/db.js";
import User from "../lib/userModel.js";
import { mapUser, verifyJwt } from "../lib/authUtils.js";
import { sendError, sendSuccess } from "../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return sendError(res, 401, "Authorization token is required.");
    }

    const payload = verifyJwt(token);
    await connectDb();
    const user = await User.findById(payload.sub);
    if (!user) {
      return sendError(res, 401, "Invalid user session.");
    }

    return sendSuccess(res, 200, "Current user fetched.", mapUser(user));
  } catch (_error) {
    return sendError(res, 401, "Invalid or expired token.");
  }
}
