import { test } from "node:test";
import assert from "node:assert/strict";
import { visibleBoard } from "../src/lib/board-selection.ts";
import { parseBoardSelection } from "../src/lib/server/board-selection.ts";

const first = "11111111-1111-4111-8111-111111111111";
const second = "22222222-2222-4222-8222-222222222222";
test("CP-ADAPT-U01: adaptive board preserves default catalog and filters both ID and category", () => {
  const items = [
    { id: first, category: "Necesidades" },
    { id: second, category: "Emociones" },
  ];
  assert.deepEqual(visibleBoard(items, null), items);
  assert.deepEqual(
    visibleBoard(items, {
      categories: ["Necesidades"],
      pictogramIds: [first, second],
    }),
    [items[0]],
  );
  assert.equal(items.length, 2);
});
test("CP-ADAPT-U02: adaptive selection rejects empty, malformed, duplicate and oversized payloads", () => {
  for (const value of [
    undefined,
    [],
    {},
    { categories: [], pictogramIds: [first] },
    { categories: ["Necesidades"], pictogramIds: [first, first] },
    { categories: ["Necesidades", "Necesidades"], pictogramIds: [first] },
    { categories: ["Necesidades"], pictogramIds: Array(181).fill(first) },
    { categories: ["Desconocida"], pictogramIds: [first] },
    { categories: ["Necesidades"], pictogramIds: ["not-a-uuid"] },
  ])
    assert.throws(() => parseBoardSelection(value));
  assert.equal(parseBoardSelection(null), null);
  assert.deepEqual(
    parseBoardSelection({ categories: ["Necesidades"], pictogramIds: [first] }),
    { categories: ["Necesidades"], pictogramIds: [first] },
  );
});
