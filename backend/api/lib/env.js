export const env = {
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  resetTokenExpiresMinutes: Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 15
};

export const assertEnv = () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }
};
