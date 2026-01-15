import type { ElementType, ReactNode } from "react";
import {
  Fragment,
  createContext,
  isValidElement,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  TTableParserAPI,
  TTableRendererAPI,
} from "@/tables-framework/defines/api.types.ts";
import type {
  IRowNavigationConfig,
  ISource,
} from "@/tables-framework/defines/common.types.ts";
import { BaseBody } from "@/tables-framework/components/areas/base-body/base-body.tsx";
import { BaseFooter } from "@/tables-framework/components/areas/base-footer/base-footer.tsx";
import { BaseHeader } from "@/tables-framework/components/areas/base-header/base-header.tsx";
import type { TRowStatusMapper } from "./hooks/use-status/use-status.ts";
import { useStatus } from "./hooks/use-status/use-status.ts";
import { renderRows } from "./utils/render-rows/render-rows.tsx";
import { BaseTable } from "@/tables-framework/components/areas/base-table/base-table.tsx";

const defaultAPI = {
  tableLayout: null,
  columnsLayout: null,
  setColumnsLayout: null,
  sorting: null,
  setSorting: null,
  filtering: null,
  setFiltering: null,
  pagination: null,
  setPagination: null,
  resetLayout: null,
  exportCSV: null,
  exportJSON: null,
  rowsStatus: null,
  setRowsStatus: null,
  source: null,
  stickyHeader: true,
  enableColumnFilters: false,
};

const TableContext = createContext<TTableRendererAPI>(defaultAPI);

interface ITableRendererProps<T = unknown> {
  source: ISource;
  table?: ElementType;
  header?: ElementType;
  body?: ElementType;
  footer?: ElementType;
  before?: ReactNode;
  after?: ReactNode;
  empty?: ReactNode;
  rowStatusMapper?: TRowStatusMapper;
  parserAPI?: Partial<TTableParserAPI>;
  container?: ElementType;
  showFooter?: boolean;
  onRowSelectionChange?: (data: T[]) => void;
  onRowDoubleClick?: IRowNavigationConfig<T>;
  stickyHeader?: boolean;
  enableColumnFilters?: boolean;
}

const TableRenderer = <T,>({
  source,
  table: TableElement = BaseTable,
  header: HeaderElement = BaseHeader,
  body: BodyElement = BaseBody,
  footer: FooterElement = BaseFooter,
  before = null,
  after = null,
  empty = null,
  rowStatusMapper = undefined,
  parserAPI = {},
  container: Container = Fragment,
  showFooter = false,
  onRowSelectionChange,
  onRowDoubleClick,
  stickyHeader = true,
  enableColumnFilters = false,
}: ITableRendererProps<T>) => {
  const { rowsStatus, setRowsStatus } = useStatus({
    rows: source.body.rows,
    rowStatusMapper,
  });

  /* --- FIX: PREVENT INFINITE SELECTION LOOP --- */
  const prevSelectedIds = useRef<string>("");

  useEffect(() => {
    if (onRowSelectionChange && rowsStatus) {
      // 1. Calculate currently selected IDs
      const currentSelectedEntry = Object.entries(rowsStatus).filter(
        ([, status]) => status.isSelected
      );

      const currentSelectedIds = currentSelectedEntry
        .map(([id]) => id)
        .sort()
        .join(",");

      // 2. Compare with previous (to prevent loop if rowsStatus triggers effect but selection is same)
      if (currentSelectedIds !== prevSelectedIds.current) {
        prevSelectedIds.current = currentSelectedIds;

        const selectedData = currentSelectedEntry
          .map(([id]) => {
            const row = source.body.rows.find((r) => r.id === id);
            return row?.source?.full; // Assuming full data object is what user wants
          })
          .filter((item) => !!item);

        onRowSelectionChange(selectedData as T[]);
      }
    }
  }, [rowsStatus, onRowSelectionChange, source.body.rows]);
  /* --- END FIX --- */

  const header = useMemo(
    () => renderRows(source.header.rows, onRowDoubleClick),
    [source.header.rows, onRowDoubleClick]
  );

  const body = useMemo(
    () => renderRows(source.body.rows, onRowDoubleClick),
    [source.body.rows, onRowDoubleClick]
  );

  const footer = useMemo(
    () => renderRows(source.footer.rows, onRowDoubleClick),
    [source.footer.rows, onRowDoubleClick]
  );

  const beforeNode = useMemo(() => {
    if (!before) {
      return null;
    }

    if (isValidElement(before)) {
      return before as ReactNode;
    } else {
      const Before = before as ElementType;

      return <Before />;
    }
  }, [before]);

  const afterNode = useMemo(() => {
    if (!after) {
      return null;
    }

    if (isValidElement(after)) {
      return after as ReactNode;
    } else {
      const After = after as ElementType;

      return <After />;
    }
  }, [after]);

  const emptyNode = useMemo(() => {
    if (!empty) {
      return null;
    }

    if (isValidElement(empty)) {
      return empty as ReactNode;
    } else {
      const Empty = empty as ElementType;

      return <Empty />;
    }
  }, [empty]);

  /* -------------------------------------------------------------------------------------------------
   * MEMOIZED API
   * -----------------------------------------------------------------------------------------------*/
  // PARSER API (Deep check)
  const [memoizedParserAPI, setMemoizedParserAPI] = useState(parserAPI);
  if (JSON.stringify(memoizedParserAPI) !== JSON.stringify(parserAPI)) {
    setMemoizedParserAPI(parserAPI);
  }

  // ROWS STATUS (Deep check)
  const [memoizedRowsStatus, setMemoizedRowsStatus] = useState(rowsStatus);
  if (JSON.stringify(memoizedRowsStatus) !== JSON.stringify(rowsStatus)) {
    setMemoizedRowsStatus(rowsStatus);
  }

  const rendererAPI = useMemo<TTableRendererAPI>(() => {
    return {
      ...defaultAPI,
      ...memoizedParserAPI,
      rowsStatus: memoizedRowsStatus,
      setRowsStatus,
      source,
      stickyHeader,
      enableColumnFilters,
    };
  }, [
    memoizedParserAPI,
    memoizedRowsStatus,
    setRowsStatus,
    source,
    stickyHeader,
    enableColumnFilters,
  ]);

  return (
    <TableContext.Provider value={rendererAPI}>
      <Container>
        {beforeNode}

        <TableElement>
          <HeaderElement>{header}</HeaderElement>

          {!body.length && emptyNode ? (
            emptyNode
          ) : (
            <BodyElement>{body}</BodyElement>
          )}

          {showFooter && <FooterElement>{footer}</FooterElement>}
        </TableElement>

        {afterNode}
      </Container>
    </TableContext.Provider>
  );
};

export type { ITableRendererProps };
export { TableContext, TableRenderer };
