import { Router } from "express";
import itemRouter from "./item.routes.js";
import authRouter from "./auth.routes.js";
import businessRouter from "./business.routes.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy."
  });
});

// TEMP: seed super admin — remove after use
router.get("/seed-admin", async (_req, res) => {
  try {
    const bcrypt = (await import("bcryptjs")).default;
    const User = (await import("../models/user.model.js")).default;
    await User.deleteOne({ email: "admin@biznest.com" });
    const hashed = await bcrypt.hash("Admin@1234", 12);
    await User.create({ name: "Super Admin", email: "admin@biznest.com", password: hashed, role: "super_admin" });
    const u = await User.findOne({ email: "admin@biznest.com" });
    const ok = await bcrypt.compare("Admin@1234", u.password);
    res.json({ success: true, passwordMatch: ok, db: u._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.use("/auth", authRouter);
router.use("/items", requireAuth, itemRouter);
router.use("/businesses", requireAuth, businessRouter);

// Admin: list all users with their business count
router.get("/users", requireAuth, async (req, res, next) => {
  try {
    const User = (await import("../models/user.model.js")).default;
    const Business = (await import("../models/business.model.js")).default;
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "super_admin") return res.status(403).json({ success: false, message: "Access denied." });
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    const usersWithStats = await Promise.all(users.map(async (u) => {
      const businesses = await Business.find({ owner: u._id }).select("name status category").lean();
      return { ...u.toObject(), businesses };
    }));
    res.json({ success: true, data: usersWithStats });
  } catch (e) { next(e); }
});

export default router;
