import mongoose from "mongoose";
import { assertEnv, env } from "./env.js";

let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

export const connectDb = async () => {
  assertEnv();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(env.mongoUri, { bufferCommands: false }).then((instance) => instance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
