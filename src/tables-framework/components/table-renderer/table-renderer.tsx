import type { ElementType, ReactNode } from "react";
import {
  Fragment,
  createContext,
  useCallback,
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
  IRowStyling,
  ISource,
} from "@/tables-framework/defines/common.types.ts";
import { BaseBody } from "@/tables-framework/components/areas/base-body/base-body.tsx";
import { BaseFooter } from "@/tables-framework/components/areas/base-footer/base-footer.tsx";
import { BaseHeader } from "@/tables-framework/components/areas/base-header/base-header.tsx";
import type { TRowStatusMapper } from "./hooks/use-status/use-status.ts";
import { useStatus } from "./hooks/use-status/use-status.ts";
import { renderRows } from "./utils/render-rows/render-rows.tsx";
import { BaseTable } from "@/tables-framework/components/areas/base-table/base-table.tsx";
import type { TVirtualization } from "@/tables-framework/defines/virtualization.types";
import { useVirtualRows } from "@/tables-framework/hooks/use-virtual-rows/use-virtual-rows";
import { VirtualRowRetentionContext } from "@/tables-framework/hooks/use-virtual-rows/virtualization-context";

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

interface ITableRendererProps<T = unknown> extends IRowStyling<T> {
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
  /** Accessible name of the table. */
  tableLabel?: string;
  isLoading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  noResultsContent?: ReactNode;
  virtualization?: TVirtualization;
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
  stripedRows = false,
  getRowStyle,
  stickyHeader = true,
  enableColumnFilters = false,
  tableLabel,
  isLoading = false,
  error,
  onRetry,
  loadingContent = "Caricamento…",
  emptyContent = "Nessun dato disponibile",
  noResultsContent = "Nessun risultato per i filtri applicati",
  virtualization,
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

        const selectedData = source.body.rows.filter(row => rowsStatus[row.id]?.isSelected)
          .map(row => row.source.full);

        onRowSelectionChange(selectedData as T[]);
      }
    }
  }, [rowsStatus, onRowSelectionChange, source.body.rows]);
  /* --- END FIX --- */

  const header = useMemo(
    () => renderRows(source.header.rows, onRowDoubleClick),
    [source.header.rows, onRowDoubleClick]
  );

  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const [retainedCells, setRetainedCells] = useState(new Map<string, string>());
  const retainRow = useCallback((cellId: string, rowId: string | null) => {
    setRetainedCells(previous => {
      if (rowId === null ? !previous.has(cellId) : previous.get(cellId) === rowId) return previous;
      const next = new Map(previous);
      if (rowId === null) next.delete(cellId); else next.set(cellId, rowId);
      return next;
    });
  }, []);
  const layoutKey = useMemo(() => JSON.stringify(source.columns.map(column => [column.id, column.props.width])), [source.columns]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const virtual = useVirtualRows(source.body.rows, virtualization, stickyHeader, layoutKey, viewportRef);
  const rowIndices = useMemo(() => new Map(virtual.enabled ? source.body.rows.map((row, index) => [row.id, index]) : []), [source.body.rows, virtual.enabled]);
  const body = useMemo(() => {
    if (!virtual.enabled) return renderRows(source.body.rows, onRowDoubleClick, { stripedRows, getRowStyle });
    const indices = new Set<number>();
    for (let index = virtual.start; index < virtual.end; index++) indices.add(index);
    for (const id of [focusedRow, ...retainedCells.values()]) {
      const index = id === null ? undefined : rowIndices.get(id);
      if (index !== undefined) indices.add(index);
    }
    const nodes: ReactNode[] = [];
    const spacer = (from: number, to: number) => {
      const height = virtual.offsets[to] - virtual.offsets[from];
      if (height <= 0) return;
      nodes.push(<tr key={`virtual-gap-${from}`} className="tbl-virtual-spacer" aria-hidden="true" role="presentation">
        <td colSpan={Math.max(1, source.columns.length)} style={{ height, padding: 0, border: 0, fontSize: 0, lineHeight: 0 }} />
      </tr>);
    };
    let cursor = 0;
    for (const index of [...indices].sort((a, b) => a - b)) {
      spacer(cursor, index);
      nodes.push(...renderRows([source.body.rows[index]], onRowDoubleClick, {
        stripedRows, getRowStyle, startIndex: index, virtualRowHeight: virtual.rowHeight, rowIndexOffset: source.header.rows.length,
      }));
      cursor = index + 1;
    }
    spacer(cursor, source.body.rows.length);
    return nodes;
  }, [source.body.rows, source.columns.length, source.header.rows.length, onRowDoubleClick, stripedRows, getRowStyle,
    virtual.enabled, virtual.start, virtual.end, virtual.offsets, virtual.rowHeight, focusedRow, retainedCells, rowIndices]);

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
      isLoading,
      tableLabel,
      virtualRowCount: virtual.enabled ? source.header.rows.length + source.body.rows.length + (showFooter ? source.footer.rows.length : 0) : undefined,
    };
  }, [
    memoizedParserAPI,
    memoizedRowsStatus,
    setRowsStatus,
    source,
    stickyHeader,
    enableColumnFilters,
    isLoading,
    tableLabel,
    virtual.enabled,
    showFooter,
  ]);

  const hasError = error !== undefined && error !== null && error !== false;
  const stateContent = isLoading ? loadingContent : hasError ? error
    : parserAPI.filtering?.length ? noResultsContent : emptyContent;
  const stateRow = (
    <tr className="tbl-state-row">
      <td colSpan={Math.max(1, source.columns.length)} className="tbl-state-cell">
        <div role={hasError && !isLoading ? "alert" : "status"}>
          {stateContent}
          {hasError && !isLoading && onRetry && <button type="button" className="tbl-button" onClick={onRetry}>Riprova</button>}
        </div>
      </td>
    </tr>
  );

  const tableNode = (
    <TableElement>
      <HeaderElement>{header}</HeaderElement>
      {isLoading || hasError ? <BodyElement>{stateRow}</BodyElement> : !source.body.rows.length && emptyNode ? (
        emptyNode
      ) : (
        <BodyElement>{source.body.rows.length ? body : stateRow}</BodyElement>
      )}
      {showFooter && <FooterElement>{footer}</FooterElement>}
    </TableElement>
  );
  return (
    <TableContext.Provider value={rendererAPI}>
      <VirtualRowRetentionContext.Provider value={virtual.enabled ? retainRow : null}>
        <Container>
          {beforeNode}
          {virtual.enabled ? <div ref={viewportRef} className="tbl-virtual-viewport"
            role="region" aria-label={`${tableLabel ?? "Tabella"}: area scorribile`} tabIndex={0}
            style={{ height: virtual.height, overflow: "auto", width: "100%", maxWidth: "100%", overflowAnchor: "none" }}
            onFocusCapture={event => setFocusedRow((event.target as HTMLElement).closest<HTMLTableRowElement>("tr[data-virtual-row]")?.dataset.virtualRow ?? null)}
            onBlurCapture={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocusedRow(null);
            }}>
            {tableNode}
          </div> : tableNode}
          {afterNode}
        </Container>
      </VirtualRowRetentionContext.Provider>
    </TableContext.Provider>
  );
};

export type { ITableRendererProps };
export { TableContext, TableRenderer };
