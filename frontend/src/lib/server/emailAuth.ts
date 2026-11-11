import { ServiceUnavailableError, RateLimitError } from "./errors";
import { InputValidationError } from "./validation";
/** Supabase handles OTP delivery and verification; no activation token is returned to an administrator. */
export async function emailAuth(path: string, body: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new ServiceUnavailableError(
      "La verificación por correo aún no está configurada.",
    );
  let response: Response;
  try {
    response = await fetch(`${url}/auth/v1/${path}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ServiceUnavailableError(
      "No se pudo conectar con el servicio de correo.",
    );
  }
  if (response.status === 429)
    throw new RateLimitError("Espera antes de solicitar otro código.");
  if (
    path === "verify" &&
    (response.status === 400 ||
      response.status === 401 ||
      response.status === 403)
  )
    throw new InputValidationError(
      "El código no es válido o expiró. Solicita uno nuevo.",
    );
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ServiceUnavailableError(
      "El servicio de correo no respondió correctamente.",
    );
  }
  if (!response.ok)
    throw new ServiceUnavailableError(
      path === "otp"
        ? "No se pudo enviar el código. Revisa la configuración de correo y espera antes de reintentar."
        : "El código no es válido o expiró. Solicita uno nuevo.",
    );
  return result as { user?: { email?: string; email_confirmed_at?: string } };
}
