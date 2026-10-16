import type { ElementType, ReactNode } from "react";
import { useState, useMemo, useEffect, isValidElement, useCallback } from "react";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell";
import { ActionsCell } from "@/tables-framework/components/cells/actions-cell/actions-cell";
import { CheckboxCell } from "@/tables-framework/components/cells/checkbox-cell/checkbox-cell";
import { NumCell } from "@/tables-framework/components/cells/num-cell/num-cell";
import { StatusCell } from "@/tables-framework/components/cells/status-cell/status-cell";
import { DateCell } from "@/tables-framework/components/cells/date-cell/date-cell";
import { CustomCell } from "@/tables-framework/components/cells/custom-cell/custom-cell";
import { InputCell } from "@/tables-framework/components/cells/input-cell/input-cell";
import { CurrencyCell } from "@/tables-framework/components/cells/currency-cell/currency-cell";
import { Column } from "@/tables-framework/components/table-parser/components/column/column";
import { HeaderCell } from "@/tables-framework/components/table-parser/components/header-cell/header-cell";
import { BodyCell } from "@/tables-framework/components/table-parser/components/body-cell/body-cell";
import type { ITableProps } from "@/tables-framework/components/table/table";
import type { ITableRendererProps } from "@/tables-framework/components/table-renderer/table-renderer";
import { Table } from "@/tables-framework/components/table/table";
import { Pagination } from "@/tables-framework/components/pagination/pagination";
import { InfiniteScroll } from "@/tables-framework/components/infinite-scroll/infinite-scroll";
import type {
  IPaginationCustomization,
  IInfiniteScrollConfig,
} from "@/tables-framework/components/pagination/pagination.types";
import { usePaginationPersistence } from "@/tables-framework/hooks/use-pagination-persistence/use-pagination-persistence";

import type {
  ILinkConfig,
  ILinkObject,
  IRowNavigationConfig,
  IUnknownProps,
  IBorderConfig,
  ICell,
  ITableLayout,
  IColumnLayout,
} from "@/tables-framework/defines/common.types";
import { AutocompleteCell } from "@/tables-framework/components/cells/autocomplete-cell.tsx/autocomplete-cell";
import type { IColumnConfig } from "@/tables-framework/defines/column-config";
import type { TCellValue } from "@/tables-framework/defines/editing.types";
import type { ITableQuery, ITableQueryProps } from "@/tables-framework/defines/query.types";
import { useTableQuery } from "@/tables-framework/hooks/use-table-query/use-table-query";
import type { TGlobalSearch } from "@/tables-framework/defines/global-search.types";
import type { ISavedTableView, ISavedViewsConfig } from "@/tables-framework/defines/saved-views.types";
import { SavedViewsToolbar } from "../table-sub-components/saved-views-toolbar/saved-views-toolbar";
export type { IColumnConfig } from "@/tables-framework/defines/column-config";
import { TableToolbar } from "@/tables-framework/components/table-sub-components/table-toolbar/table-toolbar";
import { ColumnsConfigModal } from "@/tables-framework/components/modals/columns-config-modal/columns-config-modal";
import { BaseTable } from "@/tables-framework/components/areas/base-table/base-table";
import { ObjectUtils, StringUtils } from "@/tables-framework/utils";
import { setValueAtPath } from "@/tables-framework/utils/object-utils/set-value-at-path/set-value-at-path";

export interface IPaginationConfig extends IPaginationCustomization {
  enabled?: boolean;
  position?: "top" | "bottom";
  alignment?: "left" | "center" | "right";
  limit?: number;
  limitOptions?: number[];
  onPaginationChange?: (pagination: { limit: number; offset: number }) => void;
  paginationComponent?: ReactNode;
}

export interface IDynamicTableProps<T>
  extends Omit<
    ITableProps<
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      IUnknownProps,
      T
    >,
    "children" | "data" | "dataPagination" | "onDataCountChange" | "searchTerm" | "searchColumns"
  >, Omit<ITableQueryProps, "dataMode"> {
  columns: IColumnConfig<T>[];
  data: T[];
  onRowSelectionChange?: (data: T[]) => void;
  onRowDoubleClick?: IRowNavigationConfig<T>;
  pagination?: IPaginationConfig;
  infiniteScroll?: IInfiniteScrollConfig;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  externalBorderColor?: string;
  rowSelectedColor?: string;
  headerBorder?: IBorderConfig;
  bodyBorder?: IBorderConfig;
  onDataChange?: (newData: T[], updatedRow: T) => void | Promise<void>;
  isResizable?: boolean;
  enableColumnReorder?: boolean; // Abilita il Drag & Drop
  enableColumnHiding?: boolean; // Abilita l'icona "occhio sbarrato" nell'header
  enableColumnConfig?: boolean; // Abilita il bottone "Settings" per la modale
  dragHandleVisibility?: "always" | "hover";
  enableColumnFilters?: boolean;
  globalSearch?: TGlobalSearch;
  savedViews?: ISavedViewsConfig;
}

const CELL_COMPONENTS: Record<string, ElementType> = {
  action: ActionsCell,
  checkbox: CheckboxCell,
  number: NumCell,
  status: StatusCell,
  date: DateCell,
  custom: CustomCell,
  input: InputCell,
  currency: CurrencyCell,
  autocomplete: AutocompleteCell,
  text: BaseCell,
};

const DynamicTable = <T extends object>({
  columns,
  data,
  idKey = "id",
  onRowSelectionChange,
  onRowDoubleClick,
  pagination: paginationConfig,
  infiniteScroll: infiniteScrollConfig,
  stickyHeader = true,
  externalBorderColor,
  maxHeight,
  rowSelectedColor,
  headerBorder,
  bodyBorder,
  onDataChange,
  query,
  defaultQuery,
  onQueryChange,
  dataMode = "client",
  totalItems: serverTotalItems,
  isLoading: externalIsLoading,
  layout: externalLayout,
  virtualization,
  globalSearch = false,
  savedViews,
  isResizable: globalResizable = false,
  // Estrai le nuove props (default false)
  enableColumnReorder = false,
  enableColumnHiding = false,
  enableColumnConfig = false,
  enableColumnFilters = false,
  dragHandleVisibility = "always",
  onLayoutChange: externalOnLayoutChange,
  ...tableProps
}: IDynamicTableProps<T>) => {
  const {
    enabled: paginationEnabled = false,
    position: paginationPosition = "bottom",
    alignment: paginationAlignment = "right",
    limitOptions = [5, 10, 25, 50],
    limit: initialLimit = limitOptions[0] || 50,
    onPaginationChange,
    paginationComponent: customPaginationComponent,
    // Customization options
    visibility,
    icons,
    labels,
    slots,
    classNames,
    // Phase 1 features
    controlled,
    serverSide,
    responsive,
    // Phase 3 features
    persistence,
  } = paginationConfig || {};

  const unifiedQuery = !!(query || defaultQuery || onQueryChange || dataMode === "server");
  const searchConfig = typeof globalSearch === "object" ? globalSearch : undefined;
  const [internalSearch, setInternalSearch] = useState(searchConfig?.defaultValue ?? "");
  const searchColumns = useMemo(() => searchConfig?.columns ?? columns
    .filter(column => column.type !== "checkbox" && column.type !== "action")
    .map(column => column.dataKey || column.id), [searchConfig?.columns, columns]);
  const isVirtualized = !!virtualization;
  const resolvedVirtualization = useMemo(() => virtualization ? {
    ...(typeof virtualization === "object" ? virtualization : {}),
    height: (typeof virtualization === "object" ? virtualization.height : undefined) ?? maxHeight ?? 400,
  } : false, [virtualization, maxHeight]);

  // Phase 3: Persistence hook
  const {
    initialLimit: persistedLimit,
    initialPage: persistedPage,
    initialColumnsLayout: persistedLayout,
    persistState,
  } = usePaginationPersistence({
    enabled: persistence?.enabled ?? false,
    key: persistence?.key ?? "default",
    storage: persistence?.storage,
    persistLimit: persistence?.persistLimit,
    persistPage: persistence?.persistPage,
    persistLayout: persistence?.persistLayout,
  });

  const handleQueryChange = useCallback((next: ITableQuery) => {
    if (persistence?.enabled) persistState({ page: next.page, limit: next.pageSize });
    onQueryChange?.(next);
  }, [persistence?.enabled, persistState, onQueryChange]);
  const { query: queryState, updateQuery } = useTableQuery({ query, onQueryChange: handleQueryChange,
    defaultQuery: { page: persistedPage, pageSize: persistedLimit ?? initialLimit,
      sorting: externalLayout?.sorting, filters: externalLayout?.filtering,
      ...(searchConfig?.defaultValue !== undefined ? { search: searchConfig.defaultValue } : {}), ...defaultQuery },
  });
  const searchTerm = unifiedQuery ? queryState.search ?? "" : globalSearch ? searchConfig?.value ?? internalSearch : "";

  // Internal state (used when not in controlled mode)
  const [internalOffset, setInternalOffset] = useState<number>(
    () => (persistedPage ?? 0) * (persistedLimit ?? initialLimit)
  );
  const [internalLimit, setInternalLimit] = useState<number>(
    () => persistedLimit ?? initialLimit
  );

  const [stickyWidths, setStickyWidths] = useState<Record<string, number>>({});

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [internalColumnsLayout, setInternalColumnsLayout] = useState<
    IColumnLayout[]
  >(() => persistedLayout || []);

  // Use controlled values if provided, otherwise use internal state
  const isControlled = !!controlled;
  const currentPage = unifiedQuery ? queryState.page : isControlled
    ? controlled.page
    : Math.floor(internalOffset / internalLimit);
  const limit = unifiedQuery ? queryState.pageSize : isControlled ? controlled.limit : internalLimit;
  const offset = unifiedQuery ? queryState.page * queryState.pageSize : isControlled
    ? controlled.page * controlled.limit
    : internalOffset;

  const [filteredTotalItems, setFilteredTotalItems] = useState(data.length);
  const totalItems = dataMode === "server" ? serverTotalItems ?? serverSide?.totalItems ?? data.length : serverSide?.enabled
    ? serverSide.totalItems
    : filteredTotalItems;
  const totalPages = Math.ceil(totalItems / limit);
  const isLoading = externalIsLoading ?? serverSide?.isLoading ?? false;

  // The parser applies client-side pagination after filtering and sorting.
  const dataPagination = useMemo(
    () =>
      paginationEnabled && !serverSide?.enabled ? { limit, offset } : undefined,
    [paginationEnabled, serverSide?.enabled, limit, offset]
  );

  const columnsLayout = externalLayout?.columnsLayout ?? internalColumnsLayout;

  const orderedColumns = useMemo(() => {
    // Se non abbiamo ancora un layout (primo render), usiamo l'ordine originale
    if (columnsLayout.length === 0) return columns;

    // Creiamo una mappa per accesso veloce
    const colMap = new Map(columns.map((c) => [c.id, c]));

    // Ricostruiamo l'array nell'ordine corretto
    const ordered = columnsLayout
      .map((l) => colMap.get(l.id))
      .filter((c): c is IColumnConfig<T> => !!c); // Filtra eventuali undefined

    // Aggiungiamo in coda eventuali colonne nuove che non sono ancora nel layoutIds
    const orderedIds = new Set(columnsLayout.map((l) => l.id));
    const remaining = columns.filter((c) => !orderedIds.has(c.id));

    return [...ordered, ...remaining];
  }, [columns, columnsLayout]);

  const stickyOffsets = useMemo(() => {
    const offsets: Record<string, string> = {};
    let accumulator = 0;

    // Only visible fixed columns contribute to the left offsets.
    orderedColumns.forEach((col) => {
      const hidden = columnsLayout.find((layout) => layout.id === col.id)?.props.isHidden;
      if (col.fixed && !hidden) {
        offsets[col.id] = `${accumulator}px`;
        // Aggiungiamo la larghezza (reale o 0) all'accumulatore
        accumulator += stickyWidths[col.id] || 0;
      }
    });
    return offsets;
  }, [orderedColumns, columnsLayout, stickyWidths]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (unifiedQuery) {
        updateQuery({ page });
      } else if (isControlled) {
        controlled.onPageChange(page);
      } else {
        const newOffset = page * limit;
        setInternalOffset(newOffset);
      }
      if (persistence?.enabled) {
        persistState({ page, limit });
      }
      onPaginationChange?.({ limit, offset: page * limit });
    },
    [
      isControlled,
      controlled,
      limit,
      persistence?.enabled,
      persistState,
      onPaginationChange,
      unifiedQuery,
      updateQuery,
    ]
  );

  useEffect(() => {
    if (!paginationEnabled || serverSide?.enabled || isLoading || tableProps.error) return;
    if (dataMode === "server" && serverTotalItems === undefined) return;
    const lastPage = Math.max(0, totalPages - 1);
    if (currentPage <= lastPage) return;
    // Reconcile changing totals in a separate frame and cancel stale corrections.
    const frame = requestAnimationFrame(() => handlePageChange(lastPage));
    return () => cancelAnimationFrame(frame);
  }, [
    paginationEnabled,
    serverSide?.enabled,
    totalPages,
    currentPage,
    handlePageChange,
    isLoading,
    tableProps.error,
    dataMode,
    serverTotalItems,
  ]);

  const handleSearchChange = (value: string) => {
    if (value === searchTerm) return;
    if (unifiedQuery) updateQuery({ search: value });
    else {
      if (searchConfig?.value === undefined) setInternalSearch(value);
      if (currentPage !== 0) handlePageChange(0);
    }
    searchConfig?.onChange?.(value);
  };

  const handleLimitChange = (newLimit: number) => {
    if (unifiedQuery) {
      updateQuery({ pageSize: newLimit, page: 0 });
    } else if (isControlled) {
      controlled.onLimitChange(newLimit);
      // Also reset page to 0 in controlled mode
      controlled.onPageChange(0);
    } else {
      setInternalLimit(newLimit);
      setInternalOffset(0);
    }
    // Phase 3: Persist state
    if (persistence?.enabled) {
      persistState({ page: 0, limit: newLimit });
    }
    onPaginationChange?.({ limit: newLimit, offset: 0 });
  };

  const handleCellChange = useCallback(
    (rowId: string, colKey: string, newValue: TCellValue) => {
      if (!onDataChange) return;

      // Resolve exactly the same key and serialization as the data parser.
      const rowIndex = data.findIndex((item) => {
        const id = ObjectUtils.flatten(item, true)[idKey];
        return id !== undefined && id !== null && StringUtils.serialize(id) === rowId;
      });

      if (rowIndex === -1) return;

      const updatedRow = setValueAtPath(data[rowIndex], colKey, newValue);
      const newData = [...data];
      newData[rowIndex] = updatedRow;

      return onDataChange(newData, updatedRow);
    },
    [data, idKey, onDataChange]
  );

  const measureColumn = useCallback(
    (id: string, element: HTMLTableCellElement | null) => {
      if (element) {
        // Usiamo getBoundingClientRect per precisione (include decimali)
        const width = element.getBoundingClientRect().width;

        setStickyWidths((prev) => {
          // Aggiorna solo se la larghezza è cambiata (evita re-render infiniti)
          if (Math.abs((prev[id] || 0) - width) < 1) return prev;
          return { ...prev, [id]: width };
        });
      }
    },
    []
  );

  const handleLayoutChange = useCallback(
    (newLayout: ITableLayout) => {
      if (unifiedQuery) {
        updateQuery({ sorting: newLayout.sorting ?? [], filters: newLayout.filtering ?? [] });
      }
      if (newLayout.columnsLayout) {
        // Prevent infinite loops by checking if the layout actually changed
        // Simple deep comparison using JSON.stringify for now
        const isDifferent =
          JSON.stringify(newLayout.columnsLayout) !==
          JSON.stringify(internalColumnsLayout);

        if (isDifferent) {
          // Aggiorniamo il nostro stato locale con il nuovo ordine
          setInternalColumnsLayout(newLayout.columnsLayout);

          // Phase 3: Persist layout
          if (persistence?.enabled) {
            persistState({ columnsLayout: newLayout.columnsLayout });
          }
        }
      }
      // Se l'utente aveva passato un onLayoutChange, lo chiamiamo comunque
      if (externalOnLayoutChange) externalOnLayoutChange(newLayout);
    },
    [
      externalOnLayoutChange,
      persistence?.enabled,
      persistState,
      internalColumnsLayout,
      unifiedQuery,
      updateQuery,
    ]
  );

  const handleResetLayout = useCallback(() => {
    setInternalColumnsLayout([]);
    if (persistence?.enabled) {
      persistState({ columnsLayout: [] });
    }
  }, [persistence?.enabled, persistState]);

  const getComponentByType = (type: string = "text") => {
    return CELL_COMPONENTS[type] || BaseCell;
  };

  const paginationComponent = paginationEnabled
    ? customPaginationComponent || (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handleLimitChange}
          pageSizeOptions={limitOptions}
          alignment={paginationAlignment}
          // Customization
          visibility={visibility}
          icons={icons}
          labels={labels}
          slots={slots}
          classNames={classNames}
          // Phase 1 features
          isLoading={isLoading}
          responsive={responsive}
          loadingComponent={serverSide?.loadingComponent}
        />
      )
    : null;

  const { before, after, ...passedTableProps } =
    tableProps as ITableRendererProps<T>;

  const renderNode = (node: ReactNode | undefined) => {
    if (!node) return null;
    if (isValidElement(node)) return node;
    const Component = node as ElementType;
    return <Component />;
  };

  const tableExtensions = (
    <>
      {savedViews && <SavedViewsToolbar key={`${savedViews.storage ?? "localStorage"}:${savedViews.key}`}
        config={savedViews} columns={columns} search={searchTerm} pageSize={limit} onApply={(view: ISavedTableView) => {
          setInternalColumnsLayout(view.state.columnsLayout);
          if (persistence?.enabled) persistState({ columnsLayout: view.state.columnsLayout });
          if (unifiedQuery) updateQuery({ page: 0, pageSize: view.state.pageSize,
            sorting: view.state.sorting, filters: view.state.filters, search: view.state.search ?? "" });
          else {
            handleLimitChange(view.state.pageSize);
            if (searchConfig?.value === undefined) setInternalSearch(view.state.search ?? "");
          }
          if (searchTerm !== (view.state.search ?? "")) searchConfig?.onChange?.(view.state.search ?? "");
        }} />}
      {/* TOOLBAR */}
      {enableColumnConfig && (
        <TableToolbar
          showConfigButton={enableColumnConfig}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          onResetLayout={handleResetLayout}
        />
      )}

      {/* MODALE */}
      {enableColumnConfig && (
        <ColumnsConfigModal
          open={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          columns={orderedColumns}
          layout={internalColumnsLayout}
          onLayoutChange={setInternalColumnsLayout}
          onReset={handleResetLayout}
        />
      )}
    </>
  );

  // Componente per avvolgere la tabella nello scroll, permettendo al 'before' (toolbar) di restare fisso
  const ScrollableTable = useCallback(
    ({ children }: { children: ReactNode }) => (
      <div
        style={{
          overflowX: isVirtualized ? undefined : "auto",
          overflowY: !isVirtualized && maxHeight ? "auto" : undefined,
          maxHeight: isVirtualized ? undefined : maxHeight,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          ...(externalBorderColor
            ? {
                border: `1px solid ${externalBorderColor}`,
                borderRadius: "8px",
              }
            : {}),
        }}
      >
        <BaseTable tableLayout={paginationEnabled ? "fixed" : undefined}>
          {children}
        </BaseTable>
      </div>
    ),
    [maxHeight, externalBorderColor, paginationEnabled, isVirtualized]
  );

  const tableChildren = useMemo(() => {
    return orderedColumns.map((col) => {
      const CellComponent = getComponentByType(col.type);
      const HeaderComponent = col.type === "checkbox" ? CheckboxCell : BaseCell;
      const fixed = !!col.fixed;
      const stickyLeftValue = fixed ? stickyOffsets[col.id] : undefined;
      const isCheckbox = col.type === "checkbox";
      const isColumnResizable = isCheckbox
        ? false
        : col.isResizable ?? globalResizable ?? false;
      const isDraggable =
        !isCheckbox && enableColumnReorder && col.draggable !== false;
      const isHideable = isCheckbox
        ? false
        : enableColumnHiding && col.hideable !== false;
      return (
        <Column
          key={col.id}
          id={col.id}
          width={col.width}
          isHidden={
            columnsLayout.find((l) => l.id === col.id)?.props?.isHidden
          }
          filterConfig={col.filterConfig}
          link={col.link as ILinkConfig<ILinkObject>}
        >
          <HeaderCell
            label={col.label}
            cell={[
              HeaderComponent,
              {
                ...col.headerProps,
                minWidth: col.minWidth ?? col.headerProps?.minWidth,
                showHeaderCheckbox: col.headerProps?.showHeaderCheckbox,
                onHeaderClick: col.onHeaderClick
                  ? () => col.onHeaderClick?.(col.dataKey || col.id)
                  : undefined,
                queryParam: col.queryParam,
                fixed,
                // Pass headerBorder config to both right/bottom for a grid effect if valid
                borderRight: col.headerProps?.borderRight ?? headerBorder,
                borderBottom: col.headerProps?.borderBottom ?? headerBorder,
                borderTop: col.headerProps?.borderTop, // Opt-in only
                borderLeft: col.headerProps?.borderLeft, // Opt-in only
                stickyLeft: stickyLeftValue,
                measuredRef: fixed
                  ? (el: HTMLTableCellElement) => measureColumn(col.id, el)
                  : undefined,
                isResizable: isColumnResizable,
                draggable: isDraggable,
                enableHiding: isHideable,
                dragHandleVisibility,
                backgroundColor: col.headerProps?.backgroundColor,
              } as Partial<IBaseCellProps>,
            ]}
          />
          <BodyCell
            dataKey={col.dataKey || col.id}
            cell={[
              CellComponent,
              {
                ...col.bodyProps,
                minWidth: col.minWidth ?? col.bodyProps?.minWidth,
                fixed,
                rowSelectedColor,
                component: col.component,
                // Pass bodyBorder config to both right/bottom for a grid effect if valid
                borderRight: col.bodyProps?.borderRight ?? bodyBorder,
                borderBottom: col.bodyProps?.borderBottom ?? bodyBorder,
                borderTop: col.bodyProps?.borderTop, // Opt-in only
                borderLeft: col.bodyProps?.borderLeft, // Opt-in only

                // Condition props based on column type (to avoid React warnings on DOM elements)
                ...(col.type === "input" && {
                  editable: col.editable ?? col.bodyProps?.editable,
                  validate: col.validate ?? col.bodyProps?.validate,
                  inputType: col.inputType ?? col.bodyProps?.inputType,
                  inputHeight: col.inputHeight ?? col.bodyProps?.inputHeight,
                  inputWidth: col.inputWidth ?? col.bodyProps?.inputWidth,
                  padding: col.bodyProps?.padding ?? "0.1rem 0.25rem",
                  onCellChange: (
                    val: string | number | boolean,
                    cellData: ICell
                  ) =>
                    handleCellChange(
                      cellData.row.source.id,
                      col.dataKey || col.id,
                      val
                    ),
                }),

                ...(col.type === "currency" && {
                  currencySymbol: col.currencySymbol ?? col.bodyProps?.currencySymbol,
                  symbolPosition: col.symbolPosition ?? col.bodyProps?.symbolPosition,
                  decimals: col.decimals ?? col.bodyProps?.decimals,
                }),

                ...(col.type === "status" && {
                  statusConfig: col.statusConfig ?? col.bodyProps?.statusConfig,
                  renderStatus: col.renderStatus ?? col.bodyProps?.renderStatus,
                }),

                ...(col.type === "autocomplete" && {
                  editable: col.editable ?? col.bodyProps?.editable,
                  validate: col.validate ?? col.bodyProps?.validate,
                  options: col.autocompleteOptions ?? col.bodyProps?.options,
                  getOptionLabel: col.getOptionLabel ?? col.bodyProps?.getOptionLabel,
                  isOptionEqualToValue: col.isOptionEqualToValue ?? col.bodyProps?.isOptionEqualToValue,
                  disableClearable: col.disableClearable ?? col.bodyProps?.disableClearable,
                  onCellChange: (
                    val: TCellValue,
                    cellData: ICell
                  ) =>
                    handleCellChange(
                      cellData.row.source.id,
                      col.dataKey || col.id,
                      val
                    ),
                }),

                ...(col.type === "custom" && {
                  onCellChange: (
                    val: TCellValue,
                    cellData: ICell
                  ) =>
                    handleCellChange(
                      cellData.row.source.id,
                      col.dataKey || col.id,
                      val
                    ),
                }),

                stickyLeft: stickyLeftValue,
              } as Partial<IBaseCellProps>,
            ]}
          />
        </Column>
      );
    });
  }, [
    orderedColumns,
    stickyOffsets,
    headerBorder,
    bodyBorder,
    rowSelectedColor,
    globalResizable,
    enableColumnReorder,
    enableColumnHiding,
    dragHandleVisibility,
    handleCellChange,
    measureColumn,
    columnsLayout,
  ]);

  return (
    <div>
      {paginationPosition === "top" && paginationComponent}

      {globalSearch && <div className="tbl-global-search" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {searchConfig?.label ?? "Ricerca globale"}
          <input type="search" value={searchTerm} placeholder={searchConfig?.placeholder ?? "Cerca nelle colonne…"}
            onChange={event => handleSearchChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") event.preventDefault();
              if (event.key === "Escape") { event.preventDefault(); handleSearchChange(""); }
            }} />
        </label>
        {searchTerm && <button type="button" onClick={() => handleSearchChange("")}>Cancella ricerca globale</button>}
      </div>}

      {infiniteScrollConfig?.enabled && (
        <InfiniteScroll
          hasMore={infiniteScrollConfig.hasMore}
          loadMore={infiniteScrollConfig.loadMore}
          isLoading={infiniteScrollConfig.isLoading}
          threshold={infiniteScrollConfig.threshold}
          loadMoreComponent={infiniteScrollConfig.loadMoreComponent}
          endMessage={infiniteScrollConfig.endMessage}
        />
      )}

      <Table
        table={ScrollableTable}
        stickyHeader={stickyHeader}
        data={data}
        idKey={idKey}
        dataPagination={dataPagination}
        onDataCountChange={setFilteredTotalItems}
        onRowSelectionChange={onRowSelectionChange}
        onRowDoubleClick={onRowDoubleClick}
        before={<>{renderNode(before)}{tableExtensions}</>}
        after={renderNode(after)}
        onLayoutChange={handleLayoutChange}
        enableColumnFilters={enableColumnFilters}
        parserAPI={{
          resetLayout: handleResetLayout,
        }}
        {...passedTableProps}
        dataMode={dataMode}
        searchTerm={searchTerm}
        searchColumns={searchColumns}
        isLoading={isLoading}
        virtualization={resolvedVirtualization}
        layout={useMemo(() => ({
          ...externalLayout,
          columnsLayout: externalLayout?.columnsLayout ?? internalColumnsLayout,
          ...(unifiedQuery ? { sorting: queryState.sorting, filtering: queryState.filters } : {}),
        }), [externalLayout, internalColumnsLayout, unifiedQuery, queryState.sorting, queryState.filters])}
      >
        {tableChildren}
      </Table>
      {paginationPosition === "bottom" && paginationComponent}
    </div>
  );
};

export { DynamicTable };
