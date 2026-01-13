import type {
  IColumnGroup,
  IRow,
  IColumn,
  TCellCombo,
  ICell,
} from "@/tables-framework/defines/common.types";
import { ArrayUtils } from "@/tables-framework/utils";

interface IParams {
  base: string | null;
  group: IColumnGroup;
  row: IRow;
  column: IColumn;
  paths: Map<string, string>;
  cellCombo: TCellCombo;
}

interface ICellsFactory {
  path: string;
  prev: ICell | undefined;
  add: (cell?: Partial<ICell>) => void;
  extend: () => void;
  fill: (cell?: Partial<ICell>, close?: boolean) => void;
  isConsecutive: () => boolean;
  isSimilar: () => boolean;
}

function getCellsFactory({
  base,
  group,
  row,
  column,
  paths,
  cellCombo,
}: IParams): ICellsFactory {
  let path: string;

  if (group.groupKey) {
    path = base ? `${base}.${group.groupKey}` : group.groupKey;
  } else {
    path = paths.get(row.id) || base || "";
  }

  return {
    path,

    prev: ArrayUtils.last(row.cells),

    add(c: Partial<ICell> = {}) {
      const newCell: ICell = {
        id: "",
        value: group.label,
        posX: column.posX,
        posY: row.posY,
        colSpan: 1,
        column,
        row,
        component: column.cells.header || cellCombo,
        ...c,
      };

      if (newCell.colSpan) {
        newCell.id = `${row.id}-${column.id}-${newCell.value as string}`;

        paths.set(row.id, this.path);

        row.cells.push(newCell);
      }
    },

    extend() {
      if (this.prev) {
        this.prev.colSpan++;
      }
    },

    fill(c: Partial<ICell> = {}, close?: boolean) {
      const prevPos = this.prev ? this.prev.posX + this.prev.colSpan : 0;

      this.add({
        ...c,
        value: null,
        posX: prevPos,
        colSpan: column.posX - prevPos + (close ? 1 : 0),
      });
    },

    isConsecutive() {
      return !!this.prev && this.prev.posX + this.prev.colSpan === column.posX;
    },

    isSimilar() {
      return !!row.posY && !!this.prev && paths.get(row.id) === this.path;
    },
  };
}

export { getCellsFactory };
