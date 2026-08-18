export function isSchemaRow(row: unknown): boolean {
  if (!row || typeof row !== "object") return true;
  return Object.values(row).some(
    (value) => typeof value === "string" && value.includes("mscorlib")
  );
}

export function filterSchemaRows<T extends Record<string, unknown>>(
  rows: unknown
): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is T =>
      Boolean(row) && typeof row === "object" && !isSchemaRow(row)
  );
}
