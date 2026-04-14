import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const signupController = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  res.status(201).json({
    success: true,
    message: "Signup successful.",
    data: result
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result
  });
});

export const meController = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.userId);
  res.status(200).json({
    success: true,
    message: "Current user fetched.",
    data: user
  });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body.email);
  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      resetUrl: result.resetUrl
    }
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    token: req.params.token,
    password: req.body.password
  });

  res.status(200).json({
    success: true,
    message: result.message
  });
});
