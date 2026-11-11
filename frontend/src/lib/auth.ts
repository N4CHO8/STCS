export type UserRole = "guardian" | "therapist" | "admin" | "child" | "teacher";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
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

const STORAGE_KEY = "stcs-auth-session";

const isBrowser = (): boolean => typeof window !== "undefined";

export const saveAuthSession = (session: AuthSession): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const getAuthSession = (): AuthSession | null => {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as AuthSession;
    const parts = session.token.split(".");
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      parts.length !== 3 ||
      typeof payload.exp !== "number" ||
      payload.exp * 1000 <= Date.now()
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearAuthSession = (): void => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
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
