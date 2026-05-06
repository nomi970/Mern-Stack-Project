import { connectDatabase } from "../config/database.js";
import User from "../models/user.model.js";

await connectDatabase();
const admin = await User.findOne({ email: "admin@biznest.com" });
console.log("Admin found:", admin ? JSON.stringify({ email: admin.email, role: admin.role }) : "NOT FOUND");
process.exit(0);
