import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

await connectDatabase();

// Show which DB we're connected to
console.log("DB name:", mongoose.connection.db.databaseName);
console.log("MONGO_URI:", env.mongoUri.substring(0, 60) + "...");

// Find admin
const admin = await User.findOne({ email: "admin@biznest.com" });
if (!admin) {
  console.log("❌ Admin NOT found in this DB");
} else {
  const match = await bcrypt.compare("Admin@1234", admin.password);
  console.log("✅ Admin found, password match:", match);
}

process.exit(0);
