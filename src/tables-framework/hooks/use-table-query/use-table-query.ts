import { useCallback, useMemo, useState } from "react";
import type { ITableQuery, ITableQueryProps } from "../../defines/query.types";

export function normalizeTableQuery(query: Partial<ITableQuery>): ITableQuery {
  return {
    page: Number.isFinite(query.page) ? Math.max(0, Math.floor(query.page!)) : 0,
    pageSize: Number.isFinite(query.pageSize) ? Math.max(1, Math.floor(query.pageSize!)) : 25,
    sorting: query.sorting ?? [],
    filters: query.filters ?? [],
  };
}

export function useTableQuery({ query, defaultQuery, onQueryChange }: ITableQueryProps) {
  const [internalQuery, setInternalQuery] = useState(() => normalizeTableQuery(defaultQuery ?? {}));
  const current = useMemo(() => query ? normalizeTableQuery(query) : internalQuery, [query, internalQuery]);
  const update = useCallback((patch: Partial<ITableQuery>) => {
    const changesQuery = (patch.sorting !== undefined && JSON.stringify(patch.sorting) !== JSON.stringify(current.sorting))
      || (patch.filters !== undefined && JSON.stringify(patch.filters) !== JSON.stringify(current.filters))
      || (patch.pageSize !== undefined && patch.pageSize !== current.pageSize);
    const next = normalizeTableQuery({ ...current, ...patch, ...(changesQuery ? { page: 0 } : {}) });
    if (JSON.stringify(next) === JSON.stringify(current)) return;
    if (!query) setInternalQuery(next);
    onQueryChange?.(next);
  }, [current, query, onQueryChange]);
  return { query: current, updateQuery: update };
}
