import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { getAuthOverview, login, register } from "./auth.controller";

const authRouter = Router();

authRouter.get("/", getAuthOverview);
authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));

export { authRouter };
