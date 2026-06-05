import { AuthTokenPayload } from "./auth";
import { query } from "./db";

export type AccessScope = "admin" | "own" | "assigned" | "denied";

export interface AccessDecision {
  allowed: boolean;
  scope: AccessScope;
  reason: string;
}

interface AccessRow {
  relationship: string;
}

export const canAccessSubject = async (
  authUser: AuthTokenPayload,
  subjectUserId: string
): Promise<AccessDecision> => {
  if (authUser.role === "admin") {
    return {
      allowed: true,
      scope: "admin",
      reason: "El rol admin puede auditar todos los registros."
    };
  }

  if (authUser.sub === subjectUserId) {
    return {
      allowed: true,
      scope: "own",
      reason: "El usuario accede solo a su propia informacion."
    };
  }

  const access = await query<AccessRow>(
    `SELECT relationship
     FROM user_access
     WHERE actor_user_id = $1 AND subject_user_id = $2
     LIMIT 1`,
    [authUser.sub, subjectUserId]
  );

  if (access.rowCount) {
    return {
      allowed: true,
      scope: "assigned",
      reason: `Acceso permitido por asignacion ${access.rows[0].relationship}.`
    };
  }

  return {
    allowed: false,
    scope: "denied",
    reason: "El usuario autenticado no esta asignado a este perfil."
  };
};

export const getDefaultAccessDecision = (
  authUser: AuthTokenPayload
): AccessDecision => {
  if (authUser.role === "admin") {
    return {
      allowed: true,
      scope: "admin",
      reason: "Listado administrativo filtrado por permisos del servidor."
    };
  }

  if (authUser.role === "child") {
    return {
      allowed: true,
      scope: "own",
      reason: "Listado limitado al usuario autenticado."
    };
  }

  return {
    allowed: true,
    scope: "assigned",
    reason: "Listado limitado a perfiles asignados en user_access."
  };
};
