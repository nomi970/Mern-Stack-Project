import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authorization token is required."));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token."));
  }
};
