import type { ElementType } from "react";
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
}

const DynamicTable = <T extends object>({
  columns,
  data,
  onRowSelectionChange,
  ...tableProps
}: IDynamicTableProps<T>) => {
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

  return (
    <Table
      data={data}
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
  );
};

export { DynamicTable };
