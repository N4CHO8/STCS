import {
  DEVICE_IMAGE_PATHS,
  DEVICE_MAX_PICTOGRAMS,
  isDeviceCategory
} from "@/lib/pictogramCatalog";

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

const EVENT_TYPES = new Set([
  "audio_completed",
  "audio_requested",
  "audio_started",
  "board_synced",
  "category_opened",
  "device_error",
  "device_started",
  "device_status",
  "emotion_recorded",
  "phrase_played",
  "phrase_cleared",
  "pictogram_selected",
  "navigation",
  "ui_ready",
  "sync_completed"
]);

export const PICTOGRAM_COLORS = [
  "amber",
  "blue",
  "cyan",
  "emerald",
  "indigo",
  "orange",
  "rose",
  "sage",
  "sky",
  "violet",
  "yellow"
] as const;

export const PICTOGRAM_ICONS = [
  "AlertTriangle",
  "Bath",
  "CheckCircle2",
  "Clock",
  "Droplets",
  "Frown",
  "Gamepad2",
  "HelpCircle",
  "Home",
  "MapPin",
  "MessageCircle",
  "Moon",
  "School",
  "Smile",
  "Utensils",
  "ArrowRight"
] as const;

const asObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputValidationError("El cuerpo de la solicitud debe ser un objeto JSON.");
  }

  return value as Record<string, unknown>;
};

const requiredString = (
  input: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number
) => {
  const value = input[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new InputValidationError(`${label} es obligatorio.`);
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    throw new InputValidationError(`${label} no puede superar ${maxLength} caracteres.`);
  }

  return normalized;
};

const optionalString = (
  input: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number
) => {
  const value = input[key];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new InputValidationError(`${label} debe ser texto.`);
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maxLength) {
    throw new InputValidationError(`${label} no puede superar ${maxLength} caracteres.`);
  }

  return normalized;
};

const optionalInteger = (
  input: Record<string, unknown>,
  key: string,
  label: string,
  min: number,
  max: number
) => {
  const value = input[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new InputValidationError(`${label} debe ser un entero entre ${min} y ${max}.`);
  }

  return Number(value);
};

export type PictogramInput = {
  label: string;
  message: string;
  category: string;
  colorTone: string;
  iconName: string;
  imagePath?: string;
  position?: number;
};

export const parsePictogramInput = (value: unknown): PictogramInput => {
  const input = asObject(value);
  const colorTone = requiredString(input, "colorTone", "El color", 40);
  const iconName = requiredString(input, "iconName", "El icono", 60);

  if (!PICTOGRAM_COLORS.includes(colorTone as (typeof PICTOGRAM_COLORS)[number])) {
    throw new InputValidationError("El color seleccionado no es valido.");
  }

  if (!PICTOGRAM_ICONS.includes(iconName as (typeof PICTOGRAM_ICONS)[number])) {
    throw new InputValidationError("El icono seleccionado no es valido.");
  }

  const category = requiredString(input, "category", "La categoria", 60);
  const imagePath = requiredString(input, "imagePath", "La imagen CAA", 255);

  if (!isDeviceCategory(category)) {
    throw new InputValidationError("La categoria no es compatible con el dispositivo.");
  }

  if (!DEVICE_IMAGE_PATHS.has(imagePath)) {
    throw new InputValidationError("La imagen seleccionada no esta disponible en el ESP32.");
  }

  return {
    label: requiredString(input, "label", "El nombre", 80),
    message: requiredString(input, "message", "El texto asociado", 200),
    category,
    colorTone,
    iconName,
    imagePath,
    position: optionalInteger(input, "position", "La posicion", 1, DEVICE_MAX_PICTOGRAMS)
  };
};

export type DeviceEventInput = {
  eventType: string;
  actionLabel?: string;
  context: string;
  pictogramId?: string;
  pictogramLabel?: string;
  category?: string;
  message?: string;
  emotion?: string;
  intensity?: number;
  batteryLevel?: number;
  firmwareVersion?: string;
  wifiSsid?: string;
  occurredAt?: string;
  externalEventId?: string;
};

export const parseDeviceEventInput = (value: unknown): DeviceEventInput => {
  const input = asObject(value);
  const eventType = requiredString(input, "eventType", "eventType", 60);

  if (!EVENT_TYPES.has(eventType)) {
    throw new InputValidationError("eventType no corresponde a un evento soportado.");
  }

  const occurredAt = optionalString(input, "occurredAt", "occurredAt", 40);

  if (occurredAt && Number.isNaN(Date.parse(occurredAt))) {
    throw new InputValidationError("occurredAt debe ser una fecha ISO valida.");
  }

  const pictogramId = optionalString(input, "pictogramId", "pictogramId", 60);
  const pictogramLabel = optionalString(input, "pictogramLabel", "pictogramLabel", 80);

  if (pictogramId && !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(pictogramId)) {
    throw new InputValidationError("pictogramId debe ser un UUID valido.");
  }

  if (eventType === "pictogram_selected" && !pictogramId && !pictogramLabel) {
    throw new InputValidationError(
      "pictogramId o pictogramLabel es obligatorio para pictogram_selected."
    );
  }

  return {
    eventType,
    actionLabel: optionalString(input, "actionLabel", "actionLabel", 150),
    context: optionalString(input, "context", "context", 80) ?? "Dispositivo",
    pictogramId,
    pictogramLabel,
    category: optionalString(input, "category", "category", 60),
    message: optionalString(input, "message", "message", 200),
    emotion: optionalString(input, "emotion", "emotion", 60),
    intensity: optionalInteger(input, "intensity", "intensity", 1, 5),
    batteryLevel: optionalInteger(input, "batteryLevel", "batteryLevel", 0, 100),
    firmwareVersion: optionalString(input, "firmwareVersion", "firmwareVersion", 40),
    wifiSsid: optionalString(input, "wifiSsid", "wifiSsid", 120),
    occurredAt,
    externalEventId: optionalString(input, "externalEventId", "externalEventId", 100)
  };
};
