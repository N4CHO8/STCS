import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { getEmotions, postEmotion } from "./emotions.controller";

const emotionsRouter = Router();

emotionsRouter.get("/", asyncHandler(getEmotions));
emotionsRouter.post("/", asyncHandler(postEmotion));

export { emotionsRouter };
