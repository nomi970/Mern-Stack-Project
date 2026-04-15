import serverless from "serverless-http";
import { connectDatabase } from "../src/config/database.js";
import app from "../src/app.js";

let dbReadyPromise = null;

const ensureDatabaseConnection = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDatabase();
  }
  await dbReadyPromise;
};

const expressHandler = serverless(app);

export default async function handler(req, res) {
  try {
    await ensureDatabaseConnection();
    return await expressHandler(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to initialize API.",
      errors: error.message
    });
  }
}
