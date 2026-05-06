/**
 * Run once to create the Super Admin account:
 *   node --experimental-vm-modules src/scripts/createAdmin.js
 * OR if package.json has "type": "module":
 *   node src/scripts/createAdmin.js
 */

import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import User from "../models/user.model.js";

const ADMIN_CREDENTIALS = {
  name:     "Super Admin",
  email:    "admin@biznest.com",
  password: "Admin@1234",
  role:     "super_admin"
};

await connectDatabase();

const existing = await User.findOne({ email: ADMIN_CREDENTIALS.email });
if (existing) {
  console.log("⚠️  Admin already exists:", ADMIN_CREDENTIALS.email);
  process.exit(0);
}

const hashed = await bcrypt.hash(ADMIN_CREDENTIALS.password, 12);
await User.create({ ...ADMIN_CREDENTIALS, password: hashed });

console.log("✅ Super Admin created successfully!");
console.log("   Email   :", ADMIN_CREDENTIALS.email);
console.log("   Password:", ADMIN_CREDENTIALS.password);

process.exit(0);
