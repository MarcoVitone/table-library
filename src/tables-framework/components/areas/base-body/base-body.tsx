import type { ElementType, FC, ReactNode, RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type {
  IRow,
  IRowNavigationConfig,
} from "../../../defines/common.types.ts";
import { renderSingleRow } from "../../table-renderer/utils/render-rows/render-rows.tsx";

interface IBaseBodyProps<T = unknown> {
  component?: ElementType;
  className?: string;
  children?: ReactNode;
  rows?: IRow[];
  enableVirtualization?: boolean;
  estimateRowHeight?: number;
  parentRef?: RefObject<HTMLDivElement | null>;
  onRowDoubleClick?: IRowNavigationConfig<T>;
}

const BaseBody: FC<IBaseBodyProps> = ({
  component: Component = "tbody",
  className,
  children,
  rows = [],
  enableVirtualization = false,
  estimateRowHeight = 40,
  parentRef,
  onRowDoubleClick,
}) => {
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef?.current || null,
    estimateSize: () => estimateRowHeight,
    overscan: 5,
  });

  if (enableVirtualization && parentRef) {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom =
      virtualItems.length > 0
        ? totalSize - virtualItems[virtualItems.length - 1].end
        : 0;

    return (
      <Component className={className}>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop}px`, border: 0 }} />
          </tr>
        )}
        {virtualItems.map((virtualItem) => {
          const row = rows[virtualItem.index];
          return renderSingleRow(row, virtualItem.index, onRowDoubleClick);
        })}
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom}px`, border: 0 }} />
          </tr>
        )}
      </Component>
    );
  }

  return <Component className={className}>{children}</Component>;
};

export type { IBaseBodyProps };
export { BaseBody };
