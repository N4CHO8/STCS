import { Request } from "express";

import { UserRole } from "../../models/User";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthTokenPayload;
}
