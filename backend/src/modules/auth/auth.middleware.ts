import { Response, NextFunction } from "express";

import { env } from "../../config/env";
import { UserRole } from "../../models/User";
import { verifyJwtToken } from "../../utils/jwt";
import { AuthenticatedRequest, AuthTokenPayload } from "./auth.types";

const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      message: "Acceso no autorizado. Debes enviar un token valido."
    });
    return;
  }

  try {
    const payload = verifyJwtToken<AuthTokenPayload>(token, env.jwtAccessSecret);
    req.authUser = payload;
    next();
  } catch {
    res.status(401).json({
      message: "Token invalido o expirado."
    });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userRole = req.authUser?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    res.status(403).json({
      message: "No tienes permisos para acceder a este recurso."
    });
    return;
  }

  next();
};
