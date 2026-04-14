import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  meController,
  resetPasswordController,
  signupController
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
  validateSignup
} from "../middlewares/validateAuth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", validateSignup, signupController);
authRouter.post("/login", validateLogin, loginController);
authRouter.get("/me", requireAuth, meController);
authRouter.post("/forgot-password", validateForgotPassword, forgotPasswordController);
authRouter.post("/reset-password/:token", validateResetPassword, resetPasswordController);

export default authRouter;
