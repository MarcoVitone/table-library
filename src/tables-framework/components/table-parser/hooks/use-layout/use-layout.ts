import { useCallback, useMemo, useState } from "react";
import type { ILayoutAPI } from "@/tables-framework/defines/api.types";
import type {
  ITableLayout,
  IColumn,
  TNonNullable,
  IColumnLayout,
  TSorting,
  TFiltering,
  IPagination,
} from "@/tables-framework/defines/common.types";
import { useChangeEvent } from "@/tables-framework/hooks/use-change-event/use-change-event";

const DEFAULT_SORTING: TSorting = [];
const DEFAULT_FILTERING: TFiltering = [];
const DEFAULT_PAGINATION: IPagination = {
  limit: null,
  offset: 0,
};

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
  /* -------------------------------------------------------------------------------------------------
   * CALCULATE DEFAULTS
   * -----------------------------------------------------------------------------------------------*/
  const defaults = useMemo(() => {
    let isStale = false;

    // --- COLUMNS ---
    let columnsLayout: IColumnLayout[];
    if (externalLayout?.columnsLayout?.length) {
      if (externalLayout.columnsLayout.length === parsedColumns.length) {
        const pass = externalLayout.columnsLayout.every(({ id }) => {
          return parsedColumns.find((c) => c.id === id);
        });

        if (pass) {
          columnsLayout = externalLayout.columnsLayout;
        } else {
          console.warn(`LAYOUT MISMATCH. DISCARDING`);
          isStale = true;
          columnsLayout = parsedColumns.map((c) => ({
            id: c.id,
            props: { isHidden: undefined, width: undefined },
          }));
        }
      } else {
        console.warn(`LAYOUT MISMATCH. DISCARDING`);
        isStale = true;
        columnsLayout = parsedColumns.map((c) => ({
          id: c.id,
          props: { isHidden: undefined, width: undefined },
        }));
      }
    } else {
      isStale = true;
      columnsLayout = parsedColumns.map((c) => ({
        id: c.id,
        props: { isHidden: undefined, width: undefined },
      }));
    }

    // --- SORTING ---
    let sorting: TSorting;
    if (externalLayout?.sorting) {
      sorting = externalLayout.sorting;
    } else {
      isStale = true;
      sorting = DEFAULT_SORTING;
    }

    // --- FILTERING ---
    let filtering: TFiltering;
    if (externalLayout?.filtering) {
      filtering = externalLayout.filtering;
    } else {
      isStale = true;
      filtering = DEFAULT_FILTERING;
    }

    // --- PAGINATION ---
    let pagination: IPagination;
    if (externalLayout?.pagination) {
      pagination = externalLayout.pagination;
    } else {
      isStale = true;
      pagination = DEFAULT_PAGINATION;
    }

    return { columnsLayout, sorting, filtering, pagination, isStale };
  }, [externalLayout, parsedColumns]);

  /* -------------------------------------------------------------------------------------------------
   * STATE
   * -----------------------------------------------------------------------------------------------*/
  const [columnsLayout, setColumnsLayout] = useState<IColumnLayout[]>(
    defaults.columnsLayout
  );
  const [sorting, setSorting] = useState<TSorting>(defaults.sorting);
  const [filtering, setFiltering] = useState<TFiltering>(defaults.filtering);
  const [pagination, setPagination] = useState<IPagination>(
    defaults.pagination
  );
  const [isStale, setIsStale] = useState<boolean>(defaults.isStale);

  /* -------------------------------------------------------------------------------------------------
   * SYNC STATE WITH PROPS (Render-time update pattern)
   * -----------------------------------------------------------------------------------------------*/
  const [prevDefaultsJson, setPrevDefaultsJson] = useState(
    JSON.stringify(defaults)
  );
  const currentDefaultsJson = JSON.stringify(defaults);

  if (prevDefaultsJson !== currentDefaultsJson) {
    setPrevDefaultsJson(currentDefaultsJson);
    setColumnsLayout(defaults.columnsLayout);
    setSorting(defaults.sorting);
    setFiltering(defaults.filtering);
    setPagination(defaults.pagination);
    setIsStale(defaults.isStale);
  }

  const resetLayout = useCallback(() => {
    setColumnsLayout(defaults.columnsLayout);
    setSorting(defaults.sorting);
    setFiltering(defaults.filtering);
    setPagination(defaults.pagination);
  }, [defaults]);

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
