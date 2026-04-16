import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  resetTokenExpiresMinutes: Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 15,
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || ""
};

export const validateRequiredEnv = () => {
  const missingKeys = [];
  if (!env.mongoUri) missingKeys.push("MONGO_URI");
  if (!env.jwtSecret) missingKeys.push("JWT_SECRET");

  if (missingKeys.length) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
  }
};
