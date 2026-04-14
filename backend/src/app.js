import cors from "cors";
import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.clientUrl
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
