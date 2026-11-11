import { NextRequest, NextResponse } from "next/server";

import { query } from "./db";
import { isAdultRole } from "@/lib/permissions";

import { verifyJwtToken } from "./jwt";
import { UUID_PATTERN } from "./inputs";

export type UserRole = "guardian" | "therapist" | "admin" | "child" | "teacher";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  profileId?: string;
  sid: string;
  isDemo?: boolean;
  iat?: number;
  exp?: number;
}

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  is_demo: boolean;
  credential_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const mapUser = (row: UserRow) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  isDemo: row.is_demo,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const extractBearerToken = (
  authorizationHeader?: string | null,
): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret)
    throw new Error(
      "Configura JWT_ACCESS_SECRET antes de iniciar la aplicación.",
    );
  return secret;
};

export const authenticateRequest = async (
  request: NextRequest,
): Promise<AuthTokenPayload | NextResponse> => {
  const token = extractBearerToken(request.headers.get("authorization"));

  if (!token) {
    return NextResponse.json(
      { message: "Acceso no autorizado. Debes enviar un token valido." },
      { status: 401 },
    );
  }

  let signed: AuthTokenPayload;
  try {
    signed = verifyJwtToken<AuthTokenPayload>(token, getJwtSecret());
    if (!UUID_PATTERN.test(signed.sub) || !UUID_PATTERN.test(signed.sid))
      throw new Error("Sesión inválida");
  } catch {
    return NextResponse.json(
      { message: "Token inválido o expirado." },
      { status: 401 },
    );
  }
  try {
    // The database owns revocation; a copied token cannot survive a successful logout.
    const result = await query<UserRow>(
      `SELECT u.* FROM users u JOIN app_sessions s ON s.user_id=u.id
       WHERE u.id=$1 AND s.id=$2 AND u.is_active=TRUE AND s.revoked_at IS NULL AND s.expires_at>NOW()`,
      [signed.sub, signed.sid],
    );
    const user = result.rows[0];
    if (
      !user ||
      (!user.credential_verified_at && !user.is_demo) ||
      !isAdultRole(user.role)
    )
      return NextResponse.json(
        { message: "Sesión cerrada o cuenta inactiva." },
        { status: 401 },
      );
    const profileId =
      request.headers.get("x-stcs-profile-id") ||
      request.nextUrl.searchParams.get("profileId") ||
      undefined;
    if (profileId && !UUID_PATTERN.test(profileId))
      return NextResponse.json({ message: "Perfil invalido" }, { status: 400 });
    return {
      ...signed,
      role: user.role,
      isDemo: user.is_demo,
      fullName: user.full_name,
      email: user.email,
      profileId,
    };
  } catch {
    return NextResponse.json(
      {
        message:
          "El servicio no está disponible temporalmente. Intenta nuevamente.",
      },
      { status: 503 },
    );
  }
};

export const isAuthError = (
  value: AuthTokenPayload | NextResponse,
): value is NextResponse => value instanceof NextResponse;
