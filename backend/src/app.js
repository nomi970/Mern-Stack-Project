import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./config/database.js";
import { env, validateRequiredEnv } from "./config/env.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    validateRequiredEnv();
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
