import { useMemo } from "react";
import { getCellsFactory } from "./utils/get-cell-factory/get-cell-factory";
import type {
  IColumn,
  TCellCombo,
  TRowCombo,
  IRowGroup,
  IRow,
} from "@/tables-framework/defines/common.types";
import { ArrayUtils } from "@/tables-framework/utils";

interface IProps {
  columns: IColumn[];
  cell: TCellCombo;
  row: TRowCombo;
}

function useHeader({ columns, cell: cellCombo, row: rowCombo }: IProps) {
  return useMemo<IRowGroup>(() => {
    const rows: IRow[] = [];
    const paths = new Map<string, string>();

    columns.forEach((column) => {
      column.groups.reduce<string>((base, group, rowIndex) => {
        const row: IRow =
          rows[rowIndex] ||
          (rows[rowIndex] = {
            id: `table-header-${rowIndex}`,
            posY: rowIndex,
            cells: [],
            size: columns.length,
            source: {
              id: "",
              flat: {},
              full: {},
            },
            area: "header",
            component: rowCombo,
          });

        const factory = getCellsFactory({
          base,
          group,
          row,
          column,
          paths,
          cellCombo,
        });

        if (factory.isConsecutive()) {
          if (factory.isSimilar()) {
            factory.extend();
          } else {
            factory.add();
          }
        } else {
          factory.fill();
          factory.add();
        }

        return factory.path;
      }, "");
    });

    const lastColumn = ArrayUtils.last(columns);

    if (lastColumn) {
      rows.forEach((row) => {
        if (row.cells.length < columns.length) {
          const factory = getCellsFactory({
            base: null,
            group: { groupKey: "", label: "" },
            row,
            column: lastColumn,
            paths,
            cellCombo,
          });

          factory.fill({}, true);
        }
      });
    }

    const [main, ...rest] = rows;

    return {
      rows: [...rest, main],
    };
  }, [columns, cellCombo, rowCombo]);
}

export { useHeader };
