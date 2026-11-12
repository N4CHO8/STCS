export type UserRole = "guardian" | "therapist" | "admin" | "child" | "teacher";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  expiresAt: string;
  user: AuthUser;
  expiresIn: string;
}

export interface PortalResponse<T = unknown> {
  message: string;
  data?: T;
  session?: {
    fullName: string;
    email: string;
    role: UserRole;
  };
}

// No identity or credential is stored in browser storage. The nonce only notifies other tabs.
const LEGACY_KEY = "stcs-auth-session";
export const AUTH_EVENT_KEY = "stcs-auth-event";
export const saveAuthSession = (_session: AuthSession): void => {
  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(AUTH_EVENT_KEY, crypto.randomUUID());
  } catch {
    /* Storage may be disabled; authentication still uses the cookie. */
  }
};
export const getAuthSession = async (): Promise<AuthSession | null> => {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* No storage dependency. */
  }
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (response.status === 401) return null;
  if (!response.ok)
    throw new Error("No se pudo verificar la sesión. Reintenta.");
  return response.json();
};
export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(AUTH_EVENT_KEY, crypto.randomUUID());
  } catch {
    /* The server has already revoked the session. */
  }
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "guardian":
      return "Apoderado";
    case "therapist":
      return "Especialista";
    case "teacher":
      return "Docente";
    case "admin":
      return "Administrador";
    case "child":
      return "Usuario";
    default:
      return role;
  }
};
