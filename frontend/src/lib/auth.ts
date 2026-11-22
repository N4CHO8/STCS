export type UserRole = "guardian" | "therapist" | "admin" | "child" | "teacher";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isDemo?: boolean;
  isPrivateTest?: boolean;
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
let authRevision = 0;
export const invalidatePendingAuthRequests = () => {
  authRevision++;
};

const LEGACY_KEY = "stcs-auth-session";
export const AUTH_EVENT_KEY = "stcs-auth-event";
export const saveAuthSession = (_session: AuthSession): void => {
  authRevision++;
  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(AUTH_EVENT_KEY, crypto.randomUUID());
  } catch {
    /* Storage may be disabled; authentication still uses the cookie. */
  }
};
export const getAuthSession = async (
  signal?: AbortSignal,
): Promise<AuthSession | null> => {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* No storage dependency. */
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (typeof window !== "undefined")
    window.addEventListener("pagehide", cancel);
  try {
    const response = await fetch("/api/auth/me", {
      cache: "no-store",
      mode: "same-origin",
      signal: signal
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal,
    });
    if (response.status === 401) return null;
    if (!response.ok)
      throw new Error("No se pudo verificar la sesión. Reintenta.");
    return await response.json();
  } finally {
    if (typeof window !== "undefined")
      window.removeEventListener("pagehide", cancel);
  }
};
export const clearAuthSession = (): void => {
  authRevision++;
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

/** A protected request can expire its own session, never a newer login or aborted view. */
export async function portalFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const revision = authRevision;
  const response = await fetch(input, { ...init, mode: "same-origin" });
  if (
    response.status === 401 &&
    !init?.signal?.aborted &&
    revision === authRevision
  ) {
    clearAuthSession();
    window.dispatchEvent(new Event(AUTH_EVENT_KEY));
  }
  return response;
}
