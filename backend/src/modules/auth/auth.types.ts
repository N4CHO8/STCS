import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { UserRole } from "../../models/User";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  authUser?: AuthTokenPayload;
}
