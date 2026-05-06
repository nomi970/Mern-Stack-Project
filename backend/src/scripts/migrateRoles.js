/**
 * Run once: node src/scripts/migrateRoles.js
 * Migrates old role values: "user" -> "guest", "admin" -> "super_admin"
 */
import { connectDatabase } from "../config/database.js";
import { validateRequiredEnv } from "../config/env.js";
import User from "../models/user.model.js";

validateRequiredEnv();
await connectDatabase();

const userResult = await User.updateMany({ role: "user" }, { $set: { role: "guest" } });
const adminResult = await User.updateMany({ role: "admin" }, { $set: { role: "super_admin" } });

console.log(`Migrated ${userResult.modifiedCount} users: "user" -> "guest"`);
console.log(`Migrated ${adminResult.modifiedCount} admins: "admin" -> "super_admin"`);
process.exit(0);
