import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { getRecords, postRecord } from "./records.controller";

const recordsRouter = Router();

recordsRouter.get("/", asyncHandler(getRecords));
recordsRouter.post("/", asyncHandler(postRecord));

export { recordsRouter };
