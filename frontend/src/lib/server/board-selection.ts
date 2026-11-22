import type { PoolClient } from "pg";
import type { BoardSelection } from "../board-selection";
import { DEVICE_CATEGORIES, DEVICE_MAX_PICTOGRAMS } from "../pictogramCatalog";
import { query } from "./db";
import { InputValidationError } from "./validation";

export function parseBoardSelection(value: unknown): BoardSelection | null {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InputValidationError("Selecciona categorías y pictogramas.");
  const { categories, pictogramIds } = value as Record<string, unknown>;
  if (
    !Array.isArray(categories) ||
    categories.length < 1 ||
    categories.length > DEVICE_CATEGORIES.length ||
    categories.some((c) => !DEVICE_CATEGORIES.includes(c)) ||
    new Set(categories).size !== categories.length ||
    !Array.isArray(pictogramIds) ||
    pictogramIds.length < 1 ||
    pictogramIds.length > DEVICE_MAX_PICTOGRAMS ||
    pictogramIds.some(
      (id) =>
        typeof id !== "string" ||
        !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id),
    ) ||
    new Set(pictogramIds.map((id) => id.toLowerCase())).size !==
      pictogramIds.length
  )
    throw new InputValidationError(
      "Elige al menos un pictograma y una categoría, sin duplicados.",
    );
  return {
    categories,
    pictogramIds: pictogramIds.map((id) => id.toLowerCase()),
  } as BoardSelection;
}

export async function getBoardSelection(
  profileId: string,
): Promise<BoardSelection | null> {
  const result = await query(
    "SELECT board_selection FROM student_profiles WHERE id=$1",
    [profileId],
  );
  return result.rows[0]?.board_selection ?? null;
}

// All board writers take the same profile lock. A concurrent teacher edit cannot
// leave the specialist's explicit selection empty after the selection is saved.
export async function assertUsableSelection(
  client: PoolClient,
  profileId: string,
) {
  const result = await client.query(
    `SELECT 1 FROM student_profiles sp WHERE sp.id=$1 AND sp.board_selection IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pictograms p WHERE p.student_profile_id=sp.id AND p.is_active
       AND sp.board_selection->'categories' ? p.category
       AND sp.board_selection->'pictogramIds' ? p.id::text)`,
    [profileId],
  );
  if (result.rowCount)
    throw new InputValidationError(
      "Este cambio dejaría el ESP sin pictogramas. Pide al especialista que ajuste primero la selección.",
    );
}
