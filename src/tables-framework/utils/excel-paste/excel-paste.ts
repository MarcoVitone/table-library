import { defaultTableTranslator, type TTableTranslator } from "../../localization/messages";
import type { IColumnConfig } from "../../defines/column-config";
import type { IPastePreview } from "../../defines/excel-paste.types";
import { flatten } from "../object-utils/flatten/flatten";
import { setValueAtPath } from "../object-utils/set-value-at-path/set-value-at-path";
import { serialize } from "../string-utils/serialize/serialize";
import { parseToken } from "../object-utils/parse-token/parse-token";

function readPath(row: object, key: string): unknown {
  return (Object.hasOwn(row, key) ? [key] : parseToken(key)).reduce<unknown>((value, token) =>
    value && typeof value === "object" && Object.hasOwn(value, token)
      ? (value as Record<string | number, unknown>)[token] : undefined, row);
}

/** Excel's text/plain clipboard format: quoted TSV, including embedded newlines. */
export function parseExcelClipboard(text: string, t: TTableTranslator = defaultTableTranslator): string[][] {
  if (!text || text.length > 1_000_000) throw new Error(t("paste.textLimit"));
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false, count = 0;
  const cell = () => {
    if (++count > 10_000) throw new Error(t("paste.cellLimit"));
    row.push(field); field = ""; closed = false;
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === "\t") cell();
    else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      cell(); rows.push(row); row = [];
    } else if (closed) throw new Error(t("paste.invalidFormat"));
    else if (char === '"' && field === "") quoted = true;
    else field += char;
  }
  if (quoted) throw new Error(t("paste.unclosedQuote"));
  if (field !== "" || row.length || closed) { cell(); rows.push(row); }
  if (!rows.length || rows.some(item => item.length !== rows[0].length)) {
    throw new Error(t("paste.rectangle"));
  }
  return rows;
}

function convert<T>(text: string, column: IColumnConfig<T>, t: TTableTranslator): string | number | boolean | Record<string, unknown> | null {
  if (column.type === "autocomplete") {
    if (!text && !(column.disableClearable ?? column.bodyProps?.disableClearable)) return null;
    const options = column.autocompleteOptions ?? column.bodyProps?.options ?? [];
    const label = column.getOptionLabel ?? column.bodyProps?.getOptionLabel
      ?? ((option: string | Record<string, unknown>) => typeof option === "string" ? option : String(option.label ?? ""));
    const matches = options.filter(option => label(option) === text);
    if (matches.length !== 1) throw new Error(t("paste.option"));
    return matches[0];
  }
  if (column.type !== "input") throw new Error(t("paste.readonlyColumn"));
  const type = column.inputType ?? column.bodyProps?.inputType ?? "text";
  if (type === "number" && text !== "") {
    if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(text.trim())) throw new Error(t("paste.number"));
    const value = Number(text.trim().replace(",", "."));
    if (!Number.isFinite(value)) throw new Error(t("paste.number"));
    return value;
  }
  if (type === "boolean") {
    if (/^(true|1)$/i.test(text.trim())) return true;
    if (/^(false|0)$/i.test(text.trim())) return false;
    throw new Error(t("paste.boolean"));
  }
  if (type === "date" && text && (!/^\d{4}-\d{2}-\d{2}$/.test(text)
    || !Number.isFinite(Date.parse(text)) || new Date(text).toISOString().slice(0, 10) !== text)) {
    throw new Error(t("paste.date"));
  }
  if (type === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error(t("paste.email"));
  return text;
}

/** Row indices follow the displayed order; data remains untouched until the owner commits. */
export function previewExcelPaste<T extends object>(data: T[], rowIndices: number[], columns: IColumnConfig<T>[],
  text: string, startRow: number, startColumn: number, idKey = "id", t: TTableTranslator = defaultTableTranslator): IPastePreview<T> {
  const block = parseExcelClipboard(text, t);
  if (!Number.isInteger(startRow) || !Number.isInteger(startColumn) || startRow < 0 || startColumn < 0
    || startRow >= rowIndices.length || startColumn >= columns.length) throw new Error(t("paste.destination"));
  const newData = [...data], cells: IPastePreview<T>["cells"] = [];
  const identities = new Map<string, number>();
  for (const row of data) {
    const id = serialize(flatten(row, true)[idKey]);
    identities.set(id, (identities.get(id) ?? 0) + 1);
  }
  const changed = new Set<number>();
  block.forEach((values, y) => values.forEach((text, x) => {
    const rowIndex = rowIndices[startRow + y], column = columns[startColumn + x];
    const original = data[rowIndex];
    const key = column?.dataKey ?? column?.id;
    const previous = original && key ? readPath(original, key) : undefined;
    let value: unknown = text, error: string | undefined;
    try {
      if (!original || !column) throw new Error(t("paste.overflow"));
      const identity = flatten(original, true)[idKey];
      if (identity == null || identities.get(serialize(identity)) !== 1) {
        throw new Error(t("paste.identity"));
      }
      if (column.type !== "input" && column.type !== "autocomplete") throw new Error(t("paste.readonlyColumn"));
      const editable = column.editable ?? column.bodyProps?.editable ?? true;
      if (!(typeof editable === "function" ? editable(original) : editable)) throw new Error(t("paste.readonlyCell"));
      value = convert(text, column, t);
      // Dispatch by column type to preserve each validator's value type.
      const message = column.type === "input"
        ? (column.validate ?? column.bodyProps?.validate)?.(value as string | number | boolean, original)
        : (column.validate ?? column.bodyProps?.validate)?.(value as string | Record<string, unknown> | null, original);
      if (message) throw new Error(message);
      const updated = setValueAtPath(newData[rowIndex], key!, value);
      if (serialize(flatten(updated, true)[idKey]) !== serialize(flatten(original, true)[idKey])) {
        throw new Error(t("paste.identityChanged"));
      }
      newData[rowIndex] = updated;
      if (!Object.is(value, previous)) changed.add(rowIndex);
    } catch (reason) { error = reason instanceof Error ? reason.message : t("paste.invalidValue"); }
    cells.push({ row: startRow + y + 1, column: column?.label ?? `${t("paste.column")} ${startColumn + x + 1}`, previous, value, error });
  }));
  if (cells.some(cell => cell.error)) return { cells, newData: [...data], updatedRows: [] };
  return { cells, newData, updatedRows: [...changed].map(index => newData[index]) };
}
