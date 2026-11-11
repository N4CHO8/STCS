import { InputValidationError } from "./validation";
export const UUID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export function objectInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InputValidationError("Solicitud inválida.");
  return value as Record<string, unknown>;
}
export function uuidInput(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value))
    throw new InputValidationError("Identificador inválido.");
  return value;
}
export function stringInput(
  value: unknown,
  label: string,
  max: number,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new InputValidationError(`${label} no es válido.`);
  return value.trim();
}
export function passwordInput(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length < 12 ||
    Buffer.byteLength(value) > 72
  )
    throw new InputValidationError(
      "La contraseña debe tener al menos 12 caracteres y hasta 72 bytes.",
    );
  return value; // Passwords are never normalized or trimmed.
}
