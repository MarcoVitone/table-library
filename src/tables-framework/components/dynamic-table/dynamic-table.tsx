import type { ElementType, ReactNode } from "react";
import { useState, useMemo, isValidElement, useCallback } from "react";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell";
import { ActionsCell } from "@/tables-framework/components/cells/actions-cell/actions-cell";
import { CheckboxCell } from "@/tables-framework/components/cells/checkbox-cell/checkbox-cell";
import { NumCell } from "@/tables-framework/components/cells/num-cell/num-cell";
import { StatusCell } from "@/tables-framework/components/cells/status-cell/status-cell";
import { DateCell } from "@/tables-framework/components/cells/date-cell/date-cell";
import { CustomCell } from "@/tables-framework/components/cells/custom-cell/custom-cell";
import {
  InputCell,
  type TInputType,
} from "@/tables-framework/components/cells/input-cell/input-cell";
import {
  CurrencyCell,
  type TCurrencySymbolPosition,
} from "@/tables-framework/components/cells/currency-cell/currency-cell";
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
  ICellProps,
  ILinkConfig,
  ILinkObject,
  IRowNavigationConfig,
  IUnknownProps,
  IBorderConfig,
  ICell,
  ITableLayout,
  IColumnLayout,
  IFilterConfig,
} from "@/tables-framework/defines/common.types";
import {
  AutocompleteCell,
  type TAutocompleteOption,
} from "@/tables-framework/components/cells/autocomplete-cell.tsx/autocomplete-cell";
import type { TStatusConfig } from "@/tables-framework/components/cells/status-cell/status-constants";
import { TableToolbar } from "@/tables-framework/components/table-sub-components/table-toolbar/table-toolbar";
import { ColumnsConfigModal } from "@/tables-framework/components/modals/columns-config-modal/columns-config-modal";
import { BaseTable } from "@/tables-framework/components/areas/base-table/base-table";

type TUserBaseCellProps = Partial<Omit<IBaseCellProps, keyof ICellProps>>;

export interface IColumnConfig<T = Record<string, unknown>> {
  id: string;
  label: string;
  dataKey?: string;
  type?:
    | "text"
    | "action"
    | "checkbox"
    | "date"
    | "number"
    | "status"
    | "custom"
    | "input"
    | "currency"
    | "autocomplete";
  inputType?: TInputType;
  inputHeight?: string;
  inputWidth?: string;
  // Currency Props
  currencySymbol?: string | ReactNode;
  symbolPosition?: TCurrencySymbolPosition;
  decimals?: number;
  width?: string;
  // Status Props
  statusConfig?: TStatusConfig;
  renderStatus?: (value: unknown, color?: string) => ReactNode;
  headerProps?: TUserBaseCellProps;
  bodyProps?: TUserBaseCellProps;
  component?: ElementType;
  queryParam?: string;
  onHeaderClick?: (dataKey: string) => void;
  link?: ILinkConfig<T>;
  fixed?: boolean;
  autocompleteOptions?: TAutocompleteOption[];
  getOptionLabel?: (option: TAutocompleteOption) => string;
  isOptionEqualToValue?: (
    option: TAutocompleteOption,
    value: TAutocompleteOption
  ) => boolean;
  disableClearable?: boolean;
  isResizable?: boolean;
  hideable?: boolean; // Se false, l'icona "nascondi" non apparirà per questa colonna
  draggable?: boolean; // Se false, questa colonna non può essere spostata
  filterConfig?: IFilterConfig;
}

export interface IPaginationConfig extends IPaginationCustomization {
  enabled?: boolean;
  position?: "top" | "bottom";
  alignment?: "left" | "center" | "right";
  limit?: number;
  limitOptions?: number[];
  onPaginationChange?: (pagination: { limit: number; offset: number }) => void;
  paginationComponent?: ReactNode;
}

interface IDynamicTableProps<T>
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
    "children" | "data"
  > {
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
  onDataChange?: (newData: T[], updatedRow: T) => void;
  isResizable?: boolean;
  enableColumnReorder?: boolean; // Abilita il Drag & Drop
  enableColumnHiding?: boolean; // Abilita l'icona "occhio sbarrato" nell'header
  enableColumnConfig?: boolean; // Abilita il bottone "Settings" per la modale
  dragHandleVisibility?: "always" | "hover";
  enableColumnFilters?: boolean;
}

const DynamicTable = <T extends object>({
  columns,
  data,
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
  const currentPage = isControlled
    ? controlled.page
    : Math.floor(internalOffset / internalLimit);
  const limit = isControlled ? controlled.limit : internalLimit;
  const offset = isControlled
    ? controlled.page * controlled.limit
    : internalOffset;

  // Total items: from server-side config or data length
  const totalItems = serverSide?.enabled ? serverSide.totalItems : data.length;
  const totalPages = Math.ceil(totalItems / limit);
  const isLoading = serverSide?.isLoading ?? false;

  // Paginated data: server-side mode uses data as-is, client-side slices
  const paginatedData = useMemo(() => {
    if (!paginationEnabled) {
      return data;
    }
    // In server-side mode, data is already paginated
    if (serverSide?.enabled) {
      return data;
    }
    // Client-side pagination
    return data.slice(offset, offset + limit);
  }, [data, offset, limit, paginationEnabled, serverSide?.enabled]);

  const frozenColumnCount = useMemo(() => {
    return columns.filter((c) => c.fixed).length;
  }, [columns]);

  const orderedColumns = useMemo(() => {
    // Se non abbiamo ancora un layout (primo render), usiamo l'ordine originale
    if (internalColumnsLayout.length === 0) return columns;

    // Creiamo una mappa per accesso veloce
    const colMap = new Map(columns.map((c) => [c.id, c]));

    // Ricostruiamo l'array nell'ordine corretto
    const ordered = internalColumnsLayout
      .map((l) => colMap.get(l.id))
      .filter((c): c is IColumnConfig<T> => !!c); // Filtra eventuali undefined

    // Aggiungiamo in coda eventuali colonne nuove che non sono ancora nel layoutIds
    const orderedIds = new Set(internalColumnsLayout.map((l) => l.id));
    const remaining = columns.filter((c) => !orderedIds.has(c.id));

    return [...ordered, ...remaining];
  }, [columns, internalColumnsLayout]);

  const stickyOffsets = useMemo(() => {
    const offsets: Record<string, string> = {};
    let accumulator = 0;

    // Iteriamo le colonne NELL'ORDINE VISUALE CORRENTE
    orderedColumns.forEach((col, index) => {
      // Una colonna è 'fixed' se si trova nelle prime 'frozenColumnCount' posizioni
      const isFixed = index < frozenColumnCount;

      if (isFixed) {
        offsets[col.id] = `${accumulator}px`;
        // Aggiungiamo la larghezza (reale o 0) all'accumulatore
        accumulator += stickyWidths[col.id] || 0;
      }
    });
    return offsets;
  }, [orderedColumns, frozenColumnCount, stickyWidths]);

  const handlePageChange = (page: number) => {
    if (isControlled) {
      controlled.onPageChange(page);
    } else {
      const newOffset = page * limit;
      setInternalOffset(newOffset);
    }
    // Phase 3: Persist state
    if (persistence?.enabled) {
      persistState({ page, limit });
    }
    onPaginationChange?.({ limit, offset: page * limit });
  };

  const handleLimitChange = (newLimit: number) => {
    if (isControlled) {
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
    (rowId: string, colKey: string, newValue: string | number | boolean) => {
      if (!onDataChange) return;

      // Find the row to update
      const rowIndex = data.findIndex(
        (item) =>
          (item as Record<string, unknown>).id === rowId ||
          (item as Record<string, unknown>)._id === rowId
      );

      if (rowIndex === -1) return;

      const updatedRow = { ...data[rowIndex], [colKey]: newValue };
      const newData = [...data];
      newData[rowIndex] = updatedRow;

      onDataChange(newData, updatedRow);
    },
    [data, onDataChange]
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
    ]
  );

  const handleResetLayout = useCallback(() => {
    setInternalColumnsLayout([]);
    if (persistence?.enabled) {
      persistState({ columnsLayout: [] });
    }
  }, [persistence?.enabled, persistState]);

  const getComponentByType = (type: string = "text") => {
    switch (type) {
      case "action":
        return ActionsCell;
      case "checkbox":
        return CheckboxCell;
      case "number":
        return NumCell;
      case "status":
        return StatusCell;
      case "date":
        return DateCell;
      case "custom":
        return CustomCell;
      case "input":
        return InputCell;
      case "currency":
        return CurrencyCell;
      case "autocomplete":
        return AutocompleteCell;
      case "text":
      default:
        return BaseCell;
    }
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
          overflowX: "auto",
          overflowY: maxHeight ? "auto" : undefined,
          maxHeight,
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
        <BaseTable>{children}</BaseTable>
      </div>
    ),
    [maxHeight, externalBorderColor]
  );

  const tableChildren = useMemo(() => {
    return orderedColumns.map((col, index) => {
      const CellComponent = getComponentByType(col.type);
      const HeaderComponent = col.type === "checkbox" ? CheckboxCell : BaseCell;
      const fixed = index < frozenColumnCount;
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
            internalColumnsLayout.find((l) => l.id === col.id)?.props?.isHidden
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
              } as Partial<IBaseCellProps>,
            ]}
          />
          <BodyCell
            dataKey={col.dataKey || col.id}
            cell={[
              CellComponent,
              {
                ...col.bodyProps,
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
                  inputType: col.inputType,
                  inputHeight: col.inputHeight,
                  inputWidth: col.inputWidth,
                  padding: "0.1rem 0.25rem",
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
                  currencySymbol: col.currencySymbol,
                  symbolPosition: col.symbolPosition,
                  decimals: col.decimals,
                }),

                ...(col.type === "status" && {
                  statusConfig: col.statusConfig,
                  renderStatus: col.renderStatus,
                }),

                ...(col.type === "autocomplete" && {
                  options: col.autocompleteOptions,
                  getOptionLabel: col.getOptionLabel,
                  isOptionEqualToValue: col.isOptionEqualToValue,
                  disableClearable: col.disableClearable,
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

                ...(col.type === "custom" && {
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

                stickyLeft: stickyLeftValue,
              } as Partial<IBaseCellProps>,
            ]}
          />
        </Column>
      );
    });
  }, [
    orderedColumns,
    frozenColumnCount,
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
    internalColumnsLayout,
  ]);

  return (
    <div>
      {paginationPosition === "top" && paginationComponent}

      {renderNode(before)}

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
        data={paginatedData}
        onRowSelectionChange={onRowSelectionChange}
        onRowDoubleClick={onRowDoubleClick}
        before={<>{tableExtensions}</>}
        layout={useMemo(
          () => ({ columnsLayout: internalColumnsLayout }),
          [internalColumnsLayout]
        )}
        onLayoutChange={handleLayoutChange}
        enableColumnFilters={enableColumnFilters}
        parserAPI={{
          resetLayout: handleResetLayout,
        }}
        {...passedTableProps}
      >
        {tableChildren}
      </Table>
      {renderNode(after)}
      {paginationPosition === "bottom" && paginationComponent}
    </div>
  );
};

export { DynamicTable };
