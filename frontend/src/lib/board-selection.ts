import type { DeviceCategory } from "./pictogramCatalog";

/** Null preserves the existing complete board; an explicit selection never grows implicitly. */
export type BoardSelection = {
  categories: DeviceCategory[];
  pictogramIds: string[];
};

export function visibleBoard<T extends { id: string; category: string }>(
  items: T[],
  selection: BoardSelection | null,
): T[] {
  if (!selection) return items;
  return items.filter(
    (item) =>
      selection.categories.includes(item.category as DeviceCategory) &&
      selection.pictogramIds.includes(item.id),
  );
}
