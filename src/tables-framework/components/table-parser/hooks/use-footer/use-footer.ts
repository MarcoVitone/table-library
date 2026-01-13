import { useMemo } from "react";
import type {
  IColumn,
  TCellCombo,
  TRowCombo,
  IRowGroup,
  IRow,
} from "@/tables-framework/defines/common.types";

interface IProps {
  columns: IColumn[];
  cell: TCellCombo;
  row: TRowCombo;
}

function useFooter({ columns, cell: cellCombo, row: rowCombo }: IProps) {
  return useMemo<IRowGroup>(() => {
    const row: IRow = {
      id: `table-footer-0`,
      posY: 0,
      cells: [],
      size: columns.length,
      source: {
        id: "",
        flat: {},
        full: {},
      },
      area: "footer",
      component: rowCombo,
    };

    columns.forEach((column) => {
      row.cells.push({
        id: `${row.id}-${column.id}`,
        value: column.aggregator?.(column),
        posX: column.posX,
        posY: row.posY,
        colSpan: 1,
        column,
        row,
        component: column.cells.footer || cellCombo,
      });
    });

    return {
      rows: [row],
    };
  }, [columns, cellCombo, rowCombo]);
}

export { useFooter };
