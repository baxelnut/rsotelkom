import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { routes } from "./routes";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
