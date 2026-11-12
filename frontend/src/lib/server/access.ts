import type { AuthTokenPayload } from "./auth";
import { query } from "./db";
export class ForbiddenError extends Error {
  constructor(message = "No tienes permisos para realizar esta acción.") {
    super(message);
  }
}
export type AccessScope = "own" | "assigned" | "denied";
export interface AccessDecision {
  allowed: boolean;
  scope: AccessScope;
  reason: string;
}
export const canAccessSubject = async (
  user: AuthTokenPayload,
  subjectId: string,
): Promise<AccessDecision> => {
  // Administration grants account management, never clinical access.
  if (!["guardian", "therapist", "teacher"].includes(user.role))
    return {
      allowed: false,
      scope: "denied",
      reason: "Perfil sin acceso a niños.",
    };
  const result = await query(
    `SELECT 1 FROM user_access ua JOIN users subject ON subject.id=ua.subject_user_id WHERE ua.actor_user_id=$1 AND ua.subject_user_id=$2 AND ua.relationship=$3 AND ua.approved_at IS NOT NULL AND subject.is_demo=$4 AND subject.is_private_test=$5`,
    [
      user.sub,
      subjectId,
      user.role,
      Boolean(user.isDemo),
      Boolean(user.isPrivateTest),
    ],
  );
  return {
    allowed: Boolean(result.rowCount),
    scope: result.rowCount ? "assigned" : "denied",
    reason: "Asignación vigente.",
  };
};
export const getDefaultAccessDecision = (
  _user: AuthTokenPayload,
): AccessDecision => ({
  allowed: true,
  scope: "assigned",
  reason: "Solo perfiles asignados.",
});
