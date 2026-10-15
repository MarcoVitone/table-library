import { useCallback, useMemo, useState } from "react";
import type { ITableQuery, ITableQueryProps } from "../../defines/query.types";
import { serializeTableState } from "../../utils/table-state/table-state";

export function normalizeTableQuery(query: Partial<ITableQuery>): ITableQuery {
  return {
    page: Number.isFinite(query.page) ? Math.max(0, Math.floor(query.page!)) : 0,
    pageSize: Number.isFinite(query.pageSize) ? Math.max(1, Math.floor(query.pageSize!)) : 25,
    sorting: query.sorting ?? [],
    filters: query.filters ?? [],
    ...(query.search !== undefined ? { search: query.search } : {}),
  };
}

export function useTableQuery({ query, defaultQuery, onQueryChange }: ITableQueryProps) {
  const [internalQuery, setInternalQuery] = useState(() => normalizeTableQuery(defaultQuery ?? {}));
  const current = useMemo(() => query ? normalizeTableQuery(query) : internalQuery, [query, internalQuery]);
  const update = useCallback((patch: Partial<ITableQuery>) => {
    const changesQuery = (patch.sorting !== undefined && serializeTableState(patch.sorting) !== serializeTableState(current.sorting))
      || (patch.filters !== undefined && serializeTableState(patch.filters) !== serializeTableState(current.filters))
      || (patch.pageSize !== undefined && patch.pageSize !== current.pageSize)
      || (patch.search !== undefined && patch.search !== (current.search ?? ""));
    const next = normalizeTableQuery({ ...current, ...patch, ...(changesQuery ? { page: 0 } : {}) });
    if (serializeTableState(next) === serializeTableState(current)) return;
    if (!query) setInternalQuery(next);
    onQueryChange?.(next);
  }, [current, query, onQueryChange]);
  return { query: current, updateQuery: update };
}
