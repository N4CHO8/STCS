import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { verifyToken } from "../auth/auth.middleware";
import { getRecords, postRecord } from "./records.controller";

const recordsRouter = Router();

recordsRouter.get("/", verifyToken, asyncHandler(getRecords));
recordsRouter.post("/", verifyToken, asyncHandler(postRecord));

export { recordsRouter };
