import ApiError from "../utils/ApiError.js";

const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateSignup = (req, _res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return next(new ApiError(400, "Name must be at least 2 characters."));
  }
  if (!email || typeof email !== "string" || !isEmail(email)) {
    return next(new ApiError(400, "A valid email is required."));
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters."));
  }
  return next();
};

export const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;
  if (!email || typeof email !== "string" || !isEmail(email)) {
    return next(new ApiError(400, "A valid email is required."));
  }
  if (!password || typeof password !== "string") {
    return next(new ApiError(400, "Password is required."));
  }
  return next();
};

export const validateForgotPassword = (req, _res, next) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !isEmail(email)) {
    return next(new ApiError(400, "A valid email is required."));
  }
  return next();
};

export const validateResetPassword = (req, _res, next) => {
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 8) {
    return next(new ApiError(400, "Password must be at least 8 characters."));
  }
  return next();
};
