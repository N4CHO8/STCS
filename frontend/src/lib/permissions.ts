export const ADULT_ROLES = [
  "therapist",
  "teacher",
  "guardian",
  "admin",
] as const;
export type AdultRole = (typeof ADULT_ROLES)[number];
export const isAdultRole = (role: string): role is AdultRole =>
  (ADULT_ROLES as readonly string[]).includes(role);
export const canReadSensitive = (role: string) =>
  role === "therapist" || role === "guardian";
export const canEditBoard = (role: string) =>
  role === "therapist" || role === "teacher";
export const ROLE_NAMES: Record<AdultRole, string> = {
  therapist: "Especialista",
  teacher: "Docente",
  guardian: "Apoderado",
  admin: "Administrador",
};
