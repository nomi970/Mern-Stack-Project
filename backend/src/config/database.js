import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};
