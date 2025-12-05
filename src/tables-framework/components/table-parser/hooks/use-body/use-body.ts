import { useMemo } from "react";
import type {
  IColumn,
  TCellCombo,
  TRowCombo,
  IRowGroup,
  IRow,
} from "../../../../defines/common.types";

interface IProps {
  columns: IColumn[];
  cell: TCellCombo;
  row: TRowCombo;
}

function useBody({ columns, cell: cellCombo, row: rowCombo }: IProps) {
  return useMemo<IRowGroup>(() => {
    const rows: IRow[] = [];

    columns.forEach((column) => {
      column.data.forEach(({ value, source }, rowIndex) => {
        const row: IRow =
          rows[rowIndex] ||
          (rows[rowIndex] = {
            id: `table-body-${source.id}`,
            posY: rowIndex,
            cells: [],
            size: columns.length,
            source,
            area: "body",
            component: rowCombo,
          });

        row.cells.push({
          id: `${row.id}-${column.id}`,
          value,
          posX: column.posX,
          posY: row.posY,
          colSpan: 1,
          column,
          row,
          component: column.cells.body || cellCombo,
        });
      });
    });

    return {
      rows,
    };
  }, [columns, cellCombo, rowCombo]);
}

export { useBody };
