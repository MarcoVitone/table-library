import type { CSSProperties, ElementType, FC, ReactNode } from "react";
import { useContext } from "react";
import { TableContext } from "@/tables-framework/components/table-renderer/table-renderer";

interface IBaseTableProps {
  component?: ElementType;
  children: ReactNode;
  className?: string;
  tableLayout?: CSSProperties["tableLayout"];
}

const BaseTable: FC<IBaseTableProps> = ({
  component: Component = "table",
  children,
  className,
  tableLayout,
}) => {
  const { source } = useContext(TableContext);
  const widths = source?.columns.map((column) => column.props.width) ?? [];
  const numericWidths = widths.filter((width): width is number =>
    typeof width === "number" && Number.isFinite(width)
  );
  const isSized = Component === "table" && widths.length > 0 && numericWidths.length === widths.length;

  return (
    <Component
      style={{
        borderCollapse: "separate",
        borderSpacing: "0",
        width: isSized ? numericWidths.reduce((sum, width) => sum + width, 0) : "100%",
        tableLayout: isSized ? "fixed" : tableLayout,
      }}
      className={className}
    >
      {isSized && (
        <colgroup>
          {source?.columns.map((column, index) => (
            <col key={column.id} data-column-id={column.id} style={{ width: numericWidths[index] }} />
          ))}
        </colgroup>
      )}
      {children}
    </Component>
  );
};

export type { IBaseTableProps };
export { BaseTable };
