import { Router } from "express";
import itemRouter from "./item.routes.js";
import authRouter from "./auth.routes.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy."
  });
});

router.use("/auth", authRouter);
router.use("/items", requireAuth, itemRouter);

export default router;
