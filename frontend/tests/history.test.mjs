import test from "node:test";
import assert from "node:assert/strict";
import { csvCell, csvDocument } from "../src/lib/history-contract.ts";
import { isHighRiskAlert } from "../scripts/lib/authenticated-dast.mjs";

test("Security report guard accepts both ZAP numeric and textual risk levels", () => {
  for (const risk of ["High", "Critical", "high", "3", 3])
    assert.equal(isHighRiskAlert({ risk }), true);
  for (const risk of ["Medium", "Informational", "Low", "2", 0])
    assert.equal(isHighRiskAlert({ risk }), false);
});

test("CP-RF10-U01: CSV quotes delimiters and neutralizes formulas including whitespace and full-width prefixes", () => {
  for (const value of [
    "=1+1",
    " +1",
    "-1",
    "@x",
    "\t=cmd",
    "\r=cmd",
    "\n=cmd",
    "＝1",
    "＋1",
    "－1",
    "＠x",
  ])
    assert.ok(csvCell(value).startsWith("\"'"), JSON.stringify(value));
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), '""');
  assert.equal(
    csvDocument([["Agua", "Mensaje"]]),
    '\uFEFF"Agua","Mensaje"\r\n',
  );
});
