export type HistoryFilters = {
  context?: string;
  eventType?: string;
  deviceId?: string;
  from?: string;
  to?: string;
};

/** Quote every cell and neutralize spreadsheet formulas, including leading whitespace. */
export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  const safe =
    /^[\s\uFEFF]*[=+@\uFF1D\uFF0B\uFF20\uFF0D-]/u.test(text) ||
    /^[\t\r\n]/u.test(text)
      ? "'" + text
      : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function csvDocument(rows: unknown[][]): string {
  return (
    "\uFEFF" +
    rows.map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
