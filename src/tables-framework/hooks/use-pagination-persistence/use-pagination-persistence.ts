import { useState, useCallback } from "react";
import type { TPersistenceStorage } from "@/tables-framework/components/pagination/pagination.types";
import type { IColumnLayout } from "@/tables-framework/defines/common.types";

interface IUsePaginationPersistenceOptions {
  enabled: boolean;
  key: string;
  storage?: TPersistenceStorage;
  persistLimit?: boolean;
  persistPage?: boolean;
  persistLayout?: boolean;
}

interface IPersistedState {
  limit?: number;
  page?: number;
  columnsLayout?: IColumnLayout[];
}

interface IUsePaginationPersistenceReturn {
  initialLimit: number | undefined;
  initialPage: number | undefined;
  initialColumnsLayout: IColumnLayout[] | undefined;
  persistState: (state: {
    limit?: number;
    page?: number;
    columnsLayout?: IColumnLayout[];
  }) => void;
  clearState: () => void;
}

const getStorage = (type: TPersistenceStorage): Storage | null => {
  if (typeof globalThis.window === "undefined") return null;
  try {
    return type === "localStorage" ? globalThis.localStorage : globalThis.sessionStorage;
  } catch {
    // The storage property itself can throw in restricted browser contexts.
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isWidth = (value: unknown): value is string | number | null | undefined =>
  value == null || typeof value === "string"
    || (typeof value === "number" && Number.isFinite(value) && value >= 0);
const isColumnsLayout = (value: unknown): value is IColumnLayout[] =>
  Array.isArray(value) && value.every(column =>
    isRecord(column) && typeof column.id === "string" && column.id.length > 0
    && isRecord(column.props)
    && (column.props.isHidden === undefined || typeof column.props.isHidden === "boolean")
    && isWidth(column.props.width) && isWidth(column.props.savedWidth))
  && new Set(value.map(column => column.id)).size === value.length;

function parsePersistedState(stored: string | null): IPersistedState {
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return {};
    return {
      limit: typeof parsed.limit === "number" && Number.isSafeInteger(parsed.limit) && parsed.limit > 0
        ? parsed.limit : undefined,
      page: typeof parsed.page === "number" && Number.isSafeInteger(parsed.page) && parsed.page >= 0
        ? parsed.page : undefined,
      columnsLayout: isColumnsLayout(parsed.columnsLayout) ? parsed.columnsLayout : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Hook to persist pagination state in localStorage or sessionStorage
 */
const usePaginationPersistence = (
  options: IUsePaginationPersistenceOptions
): IUsePaginationPersistenceReturn => {
  const {
    enabled,
    key,
    storage = "localStorage",
    persistLimit = true,
    persistPage = false,
    persistLayout = true,
  } = options;

  const storageKey = `pagination_${key}`;

  // Read initial values from storage
  const [initialState] = useState<IPersistedState>(() => {
    if (!enabled) return {};

    const storageInstance = getStorage(storage);
    if (!storageInstance) return {};

    try {
      const stored = storageInstance.getItem(storageKey);
      if (stored) {
        const parsed = parsePersistedState(stored);
        return {
          limit: persistLimit ? parsed.limit : undefined,
          page: persistPage ? parsed.page : undefined,
          columnsLayout: persistLayout ? parsed.columnsLayout : undefined,
        };
      }
    } catch {
      // Invalid JSON, ignore
    }

    return {};
  });

  // Persist state to storage
  const persistState = useCallback(
    (state: {
      limit?: number;
      page?: number;
      columnsLayout?: IColumnLayout[];
    }) => {
      if (!enabled) return;

      const storageInstance = getStorage(storage);
      if (!storageInstance) return;

      try {
        const stored = storageInstance.getItem(storageKey);
        const current = parsePersistedState(stored);

        const toStore: IPersistedState = { ...current };

        if (persistLimit && state.limit !== undefined) {
          toStore.limit = state.limit;
        }
        if (persistPage && state.page !== undefined) {
          toStore.page = state.page;
        }
        if (persistLayout && state.columnsLayout !== undefined) {
          toStore.columnsLayout = state.columnsLayout;
        }

        storageInstance.setItem(storageKey, JSON.stringify(toStore));
      } catch {
        // Storage full or unavailable, or JSON error, ignore
      }
    },
    [enabled, storage, storageKey, persistLimit, persistPage, persistLayout]
  );

  // Clear state from storage
  const clearState = useCallback(() => {
    if (!enabled) return;

    const storageInstance = getStorage(storage);
    if (!storageInstance) return;

    try {
      storageInstance.removeItem(storageKey);
    } catch {
      // Ignore errors
    }
  }, [enabled, storage, storageKey]);

  return {
    initialLimit: initialState.limit,
    initialPage: initialState.page,
    initialColumnsLayout: initialState.columnsLayout,
    persistState,
    clearState,
  };
};

export { usePaginationPersistence };
export type {
  IUsePaginationPersistenceOptions,
  IUsePaginationPersistenceReturn,
};
