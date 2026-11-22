import type { HistoryFilters } from "@/lib/history-contract";
import { uuidInput } from "./inputs";
import { InputValidationError } from "./validation";

export function historyFilters(params: URLSearchParams): HistoryFilters {
  const result: HistoryFilters = {};
  for (const [key, max] of [
    ["context", 80],
    ["eventType", 60],
  ] as const) {
    const value = params.get(key)?.trim();
    if (value && (value.length > max || /[\u0000-\u001f]/u.test(value)))
      throw new InputValidationError("Filtros de historial inválidos.");
    if (value) result[key] = value;
  }
  if (params.get("deviceId"))
    result.deviceId = uuidInput(params.get("deviceId"));
  for (const key of ["from", "to"] as const) {
    const value = params.get(key);
    if (!value) continue;
    const date = new Date(value + "T00:00:00.000Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value.startsWith("0000-") ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    )
      throw new InputValidationError("Fecha de historial inválida.");
    result[key] = value;
  }
  if (result.from && result.to && result.from > result.to)
    throw new InputValidationError(
      "La fecha inicial debe ser anterior a la final.",
    );
  return result;
}

// All predicates stay parameterized and are shared by pagination and full export.
export const HISTORY_PREDICATE = `e.student_profile_id=$1
  AND (e.payload->>'source'='esp32-device' OR ($2::boolean AND e.payload->>'source'='demo-fixture'))
  AND ($3::text IS NULL OR e.context=$3)
  AND ($4::text IS NULL OR e.event_type=$4)
  AND ($5::uuid IS NULL OR e.device_id=$5)
  AND ($6::date IS NULL OR e.occurred_at >= $6::date)
  AND ($7::date IS NULL OR e.occurred_at < $7::date + INTERVAL '1 day')`;

export const historyParams = (
  profileId: string,
  demo: boolean,
  filters: HistoryFilters,
) => [
  profileId,
  demo,
  filters.context ?? null,
  filters.eventType ?? null,
  filters.deviceId ?? null,
  filters.from ?? null,
  filters.to ?? null,
];
