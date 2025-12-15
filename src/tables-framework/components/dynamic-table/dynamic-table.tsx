import type { ElementType, ReactNode } from "react";
import { useState, useMemo, isValidElement } from "react";
import type { IBaseCellProps } from "../cells/base-cell/base-cell";
import { BaseCell } from "../cells/base-cell/base-cell";
import { ActionsCell } from "../cells/actions-cell/actions-cell";
import { CheckboxCell } from "../cells/checkbox-cell/checkbox-cell";
import { NumCell } from "../cells/num-cell/num-cell";
import { StatusCell } from "../cells/status-cell/status-cell";
import { DateCell } from "../cells/date-cell/date-cell";
import { CustomCell } from "../cells/custom-cell/custom-cell";
import { InputCell, type TInputType } from "../cells/input-cell/input-cell";
import {
  CurrencyCell,
  type TCurrencySymbolPosition,
} from "../cells/currency-cell/currency-cell";
import { Column } from "../table-parser/components/column/column";
import { HeaderCell } from "../table-parser/components/header-cell/header-cell";
import { BodyCell } from "../table-parser/components/body-cell/body-cell";
import type { ITableProps } from "../table/table";
import type { ITableRendererProps } from "../table-renderer/table-renderer";
import { Table } from "../table/table";
import { Pagination } from "../pagination/pagination";
import { InfiniteScroll } from "../infinite-scroll/infinite-scroll";
import type {
  IPaginationCustomization,
  IInfiniteScrollConfig,
} from "../pagination/pagination.types";
import { usePaginationPersistence } from "../../hooks/use-pagination-persistence/use-pagination-persistence";

import type {
  ICellProps,
  ILinkConfig,
  ILinkObject,
  IRowNavigationConfig,
  IUnknownProps,
  TRouterType,
  IBorderConfig,
} from "../../defines/common.types";
import {
  AutocompleteCell,
  type TAutocompleteOption,
} from "../cells/autocomplete-cell.tsx/autocomplete-cell";
import type { TStatusConfig } from "../cells/status-cell/status-constants";

export type { ILinkConfig, IRowNavigationConfig, TRouterType, IBorderConfig };

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
  ...tableProps
}: IDynamicTableProps<T>) => {
  const {
    enabled: paginationEnabled = false,
    position: paginationPosition = "bottom",
    alignment: paginationAlignment = "right",
    limit: initialLimit = 50,
    limitOptions = [5, 10, 25, 50],
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
    persistState,
  } = usePaginationPersistence({
    enabled: persistence?.enabled ?? false,
    key: persistence?.key ?? "default",
    storage: persistence?.storage,
    persistLimit: persistence?.persistLimit,
    persistPage: persistence?.persistPage,
  });

  // Internal state (used when not in controlled mode)
  const [internalOffset, setInternalOffset] = useState(
    () => (persistedPage ?? 0) * (persistedLimit ?? initialLimit)
  );
  const [internalLimit, setInternalLimit] = useState(
    () => persistedLimit ?? initialLimit
  );

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

  const handleCellChange = (
    rowId: string,
    colKey: string,
    newValue: string | number | boolean
  ) => {
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
  };

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

  const paginationComponent =
    paginationEnabled && customPaginationComponent
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
      {/* Horizontal scroll wrapper */}
      <div
        style={{
          overflowX: "auto",
          overflowY: maxHeight ? "auto" : undefined,
          maxHeight,
          ...(externalBorderColor
            ? {
                border: `1px solid ${externalBorderColor}`,
                boxSizing: "border-box",
                borderRadius: "8px",
              }
            : {}),
        }}
      >
        <Table
          stickyHeader={stickyHeader}
          data={paginatedData}
          onRowSelectionChange={onRowSelectionChange}
          onRowDoubleClick={onRowDoubleClick}
          {...passedTableProps}
        >
          {columns.map((col) => {
            const CellComponent = getComponentByType(col.type);
            const HeaderComponent =
              col.type === "checkbox" ? CheckboxCell : BaseCell;
            const fixed = col.fixed || false;
            return (
              <Column
                key={col.id}
                width={col.width}
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
                      borderBottom:
                        col.headerProps?.borderBottom ?? headerBorder,
                      borderTop: col.headerProps?.borderTop, // Opt-in only
                      borderLeft: col.headerProps?.borderLeft, // Opt-in only
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
                      inputType: col.inputType,
                      inputHeight: col.inputHeight,
                      inputWidth: col.inputWidth,
                      currencySymbol: col.currencySymbol,
                      symbolPosition: col.symbolPosition,
                      decimals: col.decimals,
                      statusConfig: col.statusConfig,
                      renderStatus: col.renderStatus,
                      padding:
                        col.type === "input" ? "0.1rem 0.25rem" : undefined,
                      options: col.autocompleteOptions,
                      getOptionLabel: col.getOptionLabel,
                      isOptionEqualToValue: col.isOptionEqualToValue,
                      onCellChange:
                        col.type === "input" || col.type === "autocomplete"
                          ? (
                              val: string | number | boolean,
                              cellData: import("../../defines/common.types").ICell
                            ) =>
                              handleCellChange(
                                cellData.row.source.id,
                                col.dataKey || col.id,
                                val
                              )
                          : undefined,
                      disableClearable: col.disableClearable,
                    } as Partial<IBaseCellProps>,
                  ]}
                />
              </Column>
            );
          })}
        </Table>
      </div>
      {renderNode(after)}
      {paginationPosition === "bottom" && paginationComponent}
    </div>
  );
};

export { DynamicTable };
