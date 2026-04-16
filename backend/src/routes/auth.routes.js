import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  meController,
  resetPasswordController,
  signupController,
  verifyOtpController
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignup,
  validateVerifyOtp
} from "../middlewares/validateAuth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", validateSignup, signupController);
authRouter.post("/login", validateLogin, loginController);
authRouter.get("/me", requireAuth, meController);
authRouter.post("/forgot-password", validateForgotPassword, forgotPasswordController);
authRouter.post("/verify-otp", validateVerifyOtp, verifyOtpController);
authRouter.post("/reset-password", validateResetPassword, resetPasswordController);

export default authRouter;
