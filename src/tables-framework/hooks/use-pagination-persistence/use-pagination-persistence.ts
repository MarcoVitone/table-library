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
  return type === "localStorage" ? localStorage : sessionStorage;
};

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
        const parsed = JSON.parse(stored) as IPersistedState;
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
        const current: IPersistedState = stored ? JSON.parse(stored) : {};

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
