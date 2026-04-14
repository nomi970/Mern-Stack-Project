import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/itemsdb",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  resetTokenExpiresMinutes: Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 15
};
