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
    data: null
  });
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  const result = await authService.verifyPasswordResetOtp({
    email: req.body.email,
    otp: req.body.otp
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      resetToken: result.resetToken
    }
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword({
    email: req.body.email,
    newPassword: req.body.newPassword,
    resetToken: req.body.resetToken
  });

  res.status(200).json({
    success: true,
    message: result.message
  });
});
