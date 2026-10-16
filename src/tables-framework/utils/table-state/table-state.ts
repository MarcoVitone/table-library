/** JSON comparison/persistence that preserves regular-expression filter values. */
export function serializeTableState(value: unknown): string {
  return JSON.stringify(value, (_key, item) => item instanceof RegExp
    ? { $tableRegExp: { source: item.source, flags: item.flags } } : item);
}
