import { Router } from "express";
import {
  approveBusinessController,
  createBusinessController,
  deleteBusinessController,
  editBusinessController,
  editMyBusinessController,
  deleteMyBusinessController,
  getAllBusinessesController,
  getMyBusinessesController,
  rejectBusinessController
} from "../controllers/business.controller.js";
import { requireRole } from "../middlewares/requireRole.middleware.js";

const businessRouter = Router();

// Guest routes
businessRouter.post("/", requireRole("guest"), createBusinessController);
businessRouter.get("/mine", requireRole("guest"), getMyBusinessesController);
businessRouter.put("/mine/:id", requireRole("guest"), editMyBusinessController);
businessRouter.delete("/mine/:id", requireRole("guest"), deleteMyBusinessController);

// Super admin routes
businessRouter.get("/", requireRole("super_admin"), getAllBusinessesController);
businessRouter.patch("/:id/approve", requireRole("super_admin"), approveBusinessController);
businessRouter.patch("/:id/reject", requireRole("super_admin"), rejectBusinessController);
businessRouter.put("/:id", requireRole("super_admin"), editBusinessController);
businessRouter.delete("/:id", requireRole("super_admin"), deleteBusinessController);

export default businessRouter;
