import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import User from "../models/user.model.js";

await connectDatabase();

await User.deleteOne({ email: "admin@biznest.com" });

const hashed = await bcrypt.hash("Admin@1234", 12);
await User.create({
  name: "Super Admin",
  email: "admin@biznest.com",
  password: hashed,
  role: "super_admin"
});

// verify immediately
const user = await User.findOne({ email: "admin@biznest.com" });
const ok = await bcrypt.compare("Admin@1234", user.password);
console.log("Password match:", ok);
console.log("✅ Admin reset done. Email: admin@biznest.com | Password: Admin@1234");
process.exit(0);
