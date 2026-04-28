import { Router } from "express";

import { testDatabaseConnection } from "../config/database";
import { authRouter } from "../modules/auth/auth.routes";
import { emotionsRouter } from "../modules/emotions/emotions.routes";
import { recordsRouter } from "../modules/records/records.routes";
import { asyncHandler } from "../utils/asyncHandler";

const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "STCS API",
    version: "1.0.0",
    modules: ["auth", "emotions", "records"]
  });
});

apiRouter.get("/health", asyncHandler(async (_req, res) => {
  const databaseConnected = await testDatabaseConnection();

  res.json({
    status: "ok",
    database: databaseConnected ? "connected" : "disconnected"
  });
}));

apiRouter.use("/auth", authRouter);
apiRouter.use("/emotions", emotionsRouter);
apiRouter.use("/records", recordsRouter);

export { apiRouter };
