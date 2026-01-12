import { useCallback, useEffect, useMemo, useState } from "react";
import type { ILayoutAPI } from "../../../../defines/api.types";
import type {
  ITableLayout,
  IColumn,
  TNonNullable,
  IColumnLayout,
  TSorting,
  TFiltering,
  IPagination,
} from "../../../../defines/common.types";
import { useChangeEvent } from "../../../../hooks/use-change-event/use-change-event";

interface IProps {
  externalLayout: ITableLayout | undefined;
  onLayoutChange: ((newLayout: ITableLayout) => void) | undefined;
  parsedColumns: IColumn[];
  enableColumnFilters?: boolean;
}

function useLayout({
  externalLayout = undefined,
  onLayoutChange = undefined,
  parsedColumns,
  enableColumnFilters = false,
}: IProps): TNonNullable<ILayoutAPI> {
  const [isStale, setIsStale] = useState<boolean>(false);

  const defaultColumnsLayout = useCallback<() => IColumnLayout[]>(() => {
    if (externalLayout?.columnsLayout) {
      if (externalLayout.columnsLayout.length === parsedColumns.length) {
        // CHECK IF THERE IS A COLUMN IN LAYOUT THAT WAS NOT INCLUDED INSIDE THE JSX TREE

        const pass = externalLayout.columnsLayout.every(({ id }) => {
          return parsedColumns.find((c) => c.id === id);
        });

        if (pass) {
          return externalLayout.columnsLayout;
        }
      }

      console.warn(`LAYOUT MISMATCH. DISCARDING`);
    }

    setIsStale(true);

    return parsedColumns.map((c) => ({
      id: c.id,
      props: {
        isHidden: undefined,
        width: undefined,
      },
    }));
  }, [externalLayout, parsedColumns]);

  const defaultSorting = useCallback<() => TSorting>(() => {
    if (externalLayout?.sorting) {
      return externalLayout.sorting;
    }

    setIsStale(true);

    return [];
  }, [externalLayout]);

  const defaultFiltering = useCallback<() => TFiltering>(() => {
    if (externalLayout?.filtering) {
      return externalLayout.filtering;
    }

    setIsStale(true);

    return [];
  }, [externalLayout]);

  const defaultPagination = useCallback<() => IPagination>(() => {
    if (externalLayout?.pagination) {
      return externalLayout.pagination;
    }

    setIsStale(true);

    return {
      limit: null,
      offset: 0,
    };
  }, [externalLayout]);

  const [columnsLayout, setColumnsLayout] =
    useState<IColumnLayout[]>(defaultColumnsLayout);
  const [sorting, setSorting] = useState<TSorting>(defaultSorting);

  const [filtering, setFiltering] = useState<TFiltering>(defaultFiltering);

  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  // Synchronize internal state with external props when they change
  useEffect(() => {
    setColumnsLayout(defaultColumnsLayout());
  }, [defaultColumnsLayout]);

  useEffect(() => {
    setSorting(defaultSorting());
  }, [defaultSorting]);

  useEffect(() => {
    setFiltering(defaultFiltering());
  }, [defaultFiltering]);

  useEffect(() => {
    setPagination(defaultPagination());
  }, [defaultPagination]);

  const resetLayout = useCallback(() => {
    setColumnsLayout(defaultColumnsLayout());
    setSorting(defaultSorting());
    setFiltering(defaultFiltering());
    setPagination(defaultPagination());
  }, [
    defaultColumnsLayout,
    defaultSorting,
    defaultFiltering,
    defaultPagination,
  ]);

  const tableLayout = useMemo<ITableLayout>(() => {
    return {
      columnsLayout,
      sorting,
      filtering,
      pagination,
    };
  }, [columnsLayout, sorting, filtering, pagination]);

  const onLayoutChangeHandler = useCallback(
    (e: ITableLayout) => {
      if (onLayoutChange) {
        onLayoutChange(e);

        setIsStale(false);
      }
    },
    [onLayoutChange]
  );

  useChangeEvent(onLayoutChangeHandler, tableLayout, isStale);

  return {
    tableLayout,
    columnsLayout,
    setColumnsLayout,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination,
    resetLayout,
    enableColumnFilters,
  };
}

export { useLayout };
