import { Router } from "express";

import { requireRole, verifyToken } from "../auth/auth.middleware";
import {
  getAdminPortal,
  getGuardianPortal,
  getPortalOverview,
  getTherapistPortal
} from "./portal.controller";

const portalRouter = Router();

portalRouter.get("/resumen", verifyToken, getPortalOverview);
portalRouter.get("/guardian", verifyToken, requireRole("guardian"), getGuardianPortal);
portalRouter.get("/especialista", verifyToken, requireRole("therapist"), getTherapistPortal);
portalRouter.get("/admin", verifyToken, requireRole("admin"), getAdminPortal);

export { portalRouter };
