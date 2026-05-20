import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import {
  getAuthenticatedUser,
  getAuthOverview,
  login,
  register
} from "./auth.controller";
import { verifyToken } from "./auth.middleware";

const authRouter = Router();

authRouter.get("/", getAuthOverview);
authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", verifyToken, asyncHandler(getAuthenticatedUser));

export { authRouter };
