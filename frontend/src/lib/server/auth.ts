import { NextRequest, NextResponse } from "next/server";

import { verifyJwtToken } from "./jwt";

export type UserRole = "guardian" | "therapist" | "admin" | "child";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export const mapUser = (row: UserRow) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString()
});

const extractBearerToken = (authorizationHeader?: string | null): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const getJwtSecret = (): string =>
  process.env.JWT_ACCESS_SECRET ?? "stcs-dev-jwt-secret-cambiar-en-produccion";

export const authenticateRequest = (
  request: NextRequest
): AuthTokenPayload | NextResponse => {
  const token = extractBearerToken(request.headers.get("authorization"));

  if (!token) {
    return NextResponse.json(
      { message: "Acceso no autorizado. Debes enviar un token valido." },
      { status: 401 }
    );
  }

  try {
    return verifyJwtToken<AuthTokenPayload>(token, getJwtSecret());
  } catch {
    return NextResponse.json(
      { message: "Token invalido o expirado." },
      { status: 401 }
    );
  }
};

export const isAuthError = (
  value: AuthTokenPayload | NextResponse
): value is NextResponse => value instanceof NextResponse;
