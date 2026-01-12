import type { ElementType, ReactNode } from "react";
import {
  Fragment,
  createContext,
  isValidElement,
  useMemo,
  useEffect,
  useRef,
} from "react";
import type {
  TTableParserAPI,
  TTableRendererAPI,
} from "../../defines/api.types.ts";
import type {
  IRowNavigationConfig,
  ISource,
} from "../../defines/common.types.ts";
import { BaseBody } from "../areas/base-body/base-body.tsx";
import { BaseFooter } from "../areas/base-footer/base-footer.tsx";
import { BaseHeader } from "../areas/base-header/base-header.tsx";
import type { TRowStatusMapper } from "./hooks/use-status/use-status.ts";
import { useStatus } from "./hooks/use-status/use-status.ts";
import { renderRows } from "./utils/render-rows/render-rows.tsx";
import { BaseTable } from "../areas/base-table/base-table.tsx";

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
  density: null,
  setDensity: null,
  resetLayout: null,
  exportCSV: null,
  exportJSON: null,
  rowsStatus: null,
  setRowsStatus: null,
  source: null,
  stickyHeader: true,
  enableColumnFilters: false,
  enableVirtualization: false,
  scrollContainerRef: undefined,
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
  enableVirtualization?: boolean;
  estimateRowHeight?: number;
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
  enableVirtualization = false,
  estimateRowHeight = 40,
}: ITableRendererProps<T>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { rowsStatus, setRowsStatus } = useStatus({
    rows: source.body.rows,
    rowStatusMapper,
  });

  useEffect(() => {
    if (onRowSelectionChange && rowsStatus) {
      const selectedData = Object.entries(rowsStatus)
        .filter(([, status]) => status.isSelected)
        .map(([id]) => {
          const row = source.body.rows.find((r) => r.id === id);
          return row?.source?.full; // Assuming full data object is what user wants
        })
        .filter((item) => !!item);
      onRowSelectionChange(selectedData as T[]);
    }
  }, [rowsStatus, onRowSelectionChange, source.body.rows]);

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

  const rendererAPI = useMemo<TTableRendererAPI>(() => {
    return {
      ...defaultAPI,
      ...parserAPI,
      rowsStatus,
      setRowsStatus,
      source,
      stickyHeader,
      enableColumnFilters,
      enableVirtualization,
      scrollContainerRef: enableVirtualization ? scrollContainerRef : undefined,
      estimateRowHeight,
    };
  }, [
    parserAPI,
    rowsStatus,
    setRowsStatus,
    source,
    stickyHeader,
    enableColumnFilters,
    enableVirtualization,
    estimateRowHeight,
  ]);

  return (
    <TableContext.Provider value={rendererAPI}>
      <Container ref={enableVirtualization ? scrollContainerRef : undefined}>
        {beforeNode}

        <TableElement>
          <HeaderElement>{header}</HeaderElement>

          {!body.length && emptyNode ? (
            emptyNode
          ) : (
            <BodyElement
              rows={enableVirtualization ? source.body.rows : undefined}
              enableVirtualization={enableVirtualization}
              estimateRowHeight={estimateRowHeight}
              parentRef={enableVirtualization ? scrollContainerRef : undefined}
              onRowDoubleClick={onRowDoubleClick}
            >
              {enableVirtualization ? null : body}
            </BodyElement>
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
