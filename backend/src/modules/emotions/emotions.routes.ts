import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { verifyToken } from "../auth/auth.middleware";
import { getEmotions, postEmotion } from "./emotions.controller";

const emotionsRouter = Router();

emotionsRouter.get("/", verifyToken, asyncHandler(getEmotions));
emotionsRouter.post("/", verifyToken, asyncHandler(postEmotion));

export { emotionsRouter };
