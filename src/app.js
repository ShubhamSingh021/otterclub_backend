import cors from "cors";
import express from "express";
import morgan from "morgan";
import env from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin.includes(",") ? env.clientOrigin.split(",") : env.clientOrigin,
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
