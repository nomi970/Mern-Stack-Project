import ApiError from "../utils/ApiError.js";

export const validateCreateItem = (req, _res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return next(new ApiError(400, "Name is required and must be at least 2 characters."));
  }
  return next();
};

export const validateUpdateItem = (req, _res, next) => {
  const { name, status } = req.body;
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    return next(new ApiError(400, "Name must be at least 2 characters."));
  }
  if (status !== undefined && !["active", "archived"].includes(status)) {
    return next(new ApiError(400, "Status must be either active or archived."));
  }
  return next();
};
