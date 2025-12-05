import type { ElementType, ReactNode } from "react";
import { useState, useMemo } from "react";
import type { IBaseCellProps } from "../cells/base-cell/base-cell";
import { BaseCell } from "../cells/base-cell/base-cell";
import { ActionsCell } from "../cells/actions-cell/actions-cell";
import { CheckboxCell } from "../cells/checkbox-cell/checkbox-cell";
import { NumCell } from "../cells/num-cell/num-cell";
import { StatusCell } from "../cells/status-cell/status-cell";
import { DateCell } from "../cells/date-cell/date-cell";
import { Column } from "../table-parser/components/column/column";
import { HeaderCell } from "../table-parser/components/header-cell/header-cell";
import { BodyCell } from "../table-parser/components/body-cell/body-cell";
import type { ITableProps } from "../table/table";
import { Table } from "../table/table";
import { Pagination } from "../pagination/pagination";
import { InfiniteScroll } from "../infinite-scroll/infinite-scroll";
import type {
  IPaginationCustomization,
  IInfiniteScrollConfig,
} from "../pagination/pagination.types";
import { usePaginationPersistence } from "../../hooks/use-pagination-persistence/use-pagination-persistence";

import type { ICellProps, IUnknownProps } from "../../defines/common.types";

type TUserBaseCellProps = Partial<Omit<IBaseCellProps, keyof ICellProps>>;

export interface IColumnConfig {
  id: string;
  label: string;
  dataKey?: string;
  type?: "text" | "action" | "checkbox" | "date" | "number" | "status";
  width?: string;
  headerProps?: TUserBaseCellProps;
  bodyProps?: TUserBaseCellProps;
  component?: ElementType;
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
  columns: IColumnConfig[];
  data: T[];
  onRowSelectionChange?: (data: T[]) => void;
  pagination?: IPaginationConfig;
  infiniteScroll?: IInfiniteScrollConfig;
}

const DynamicTable = <T extends object>({
  columns,
  data,
  onRowSelectionChange,
  pagination: paginationConfig,
  infiniteScroll: infiniteScrollConfig,
  ...tableProps
}: IDynamicTableProps<T>) => {
  const {
    enabled: paginationEnabled = false,
    position: paginationPosition = "bottom",
    alignment: paginationAlignment = "right",
    limit: initialLimit = 10,
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
      case "text":
      default:
        return BaseCell;
    }
  };

  const paginationComponent =
    paginationEnabled && totalItems > 0 && customPaginationComponent ? (
      customPaginationComponent
    ) : (
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
    );

  return (
    <div>
      {paginationPosition === "top" && paginationComponent}

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
      <div style={{ overflowX: "auto" }}>
        <Table
          data={paginatedData}
          onRowSelectionChange={onRowSelectionChange}
          {...tableProps}
        >
          {columns.map((col) => {
            const CellComponent = col.component || getComponentByType(col.type);
            const HeaderComponent =
              col.type === "checkbox" ? CheckboxCell : BaseCell;

            return (
              <Column key={col.id} width={col.width}>
                <HeaderCell
                  label={col.label}
                  cell={[
                    HeaderComponent,
                    {
                      ...col.headerProps,
                      showHeaderCheckbox: col.headerProps?.showHeaderCheckbox,
                    } as Partial<IBaseCellProps>,
                  ]}
                />
                <BodyCell
                  dataKey={col.dataKey || col.id}
                  cell={[
                    CellComponent,
                    { ...col.bodyProps } as Partial<IBaseCellProps>,
                  ]}
                />
              </Column>
            );
          })}
        </Table>
      </div>
      {paginationPosition === "bottom" && paginationComponent}
    </div>
  );
};

export { DynamicTable };
