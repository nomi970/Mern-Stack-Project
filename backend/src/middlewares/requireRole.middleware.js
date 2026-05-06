import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const requireRole = (...roles) => async (req, _res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || !roles.includes(user.role)) {
      return next(new ApiError(403, "Access denied."));
    }
    req.userRole = user.role;
    return next();
  } catch {
    return next(new ApiError(500, "Authorization check failed."));
  }
};
