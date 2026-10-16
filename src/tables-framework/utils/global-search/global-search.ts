import { parseToken } from "../object-utils/parse-token/parse-token";

export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function searchText(value: unknown, seen = new Set<object>()): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return normalizeSearch(String(value));
  }
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().toLowerCase();
  if (typeof value !== "object" || "$$typeof" in value || seen.has(value)) return "";
  seen.add(value);
  return Object.values(value).map(item => searchText(item, seen)).join(" ");
}

/** Compile paths once; never search unrelated properties of a row. */
export function createSearchAccessor(columns: string[]) {
  const paths = [...new Set(columns)].filter(Boolean).map(key => ({ key, path: parseToken(key) }));
  return (row: object): string[] => paths.map(({ key, path }) => {
    let value: unknown = row;
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      value = (row as Record<string, unknown>)[key];
    } else {
      for (const part of path) {
        if (!value || typeof value !== "object" || !Object.prototype.hasOwnProperty.call(value, part)) return "";
        value = (value as Record<string | number, unknown>)[part];
      }
    }
    return searchText(value);
  });
}

export function matchesGlobalSearch(values: string[], tokens: string[]): boolean {
  return tokens.every(token => values.some(value => value.includes(token)));
}
