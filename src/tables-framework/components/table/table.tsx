import type { ComponentType, JSX } from "react";
import type {
  IMultipleCells,
  IMultipleRows,
  TSingleCell,
  TSingleRow,
} from "../../defines/common.types.ts";
import { BaseCell } from "../cells/base-cell/base-cell.jsx";
import { BaseRow } from "../rows/base-row/base-row.jsx";
import type { ITableParserProps } from "../table-parser/table-parser.tsx";
import { TableParser } from "../table-parser/table-parser.jsx";
import { useCustomElements } from "./hooks/use-custom-elements/use-custom-elements.js";

type TBase<T> = Omit<ITableParserProps<T>, "cells" | "rows">;

interface ITableProps<TC, TCH, TCB, TCF, TR, TRH, TRB, TRF, T = unknown>
  extends TBase<T> {
  parser?: ComponentType<ITableParserProps<T>>;
  cells?: TSingleCell<TC> | IMultipleCells<TCH, TCB, TCF>;
  rows?: TSingleRow<TR> | IMultipleRows<TRH, TRB, TRF>;
  onRowSelectionChange?: (data: T[]) => void;
}

const Table = <TC, TCH, TCB, TCF, TR, TRH, TRB, TRF, T>({
  parser: ParserComponent = TableParser,
  cells: customCells = undefined,
  rows: customRows = undefined,
  children = null,
  onRowSelectionChange,
  ...rest
}: ITableProps<TC, TCH, TCB, TCF, TR, TRH, TRB, TRF, T>): JSX.Element => {
  const cells = useCustomElements(customCells, BaseCell);
  const rows = useCustomElements(customRows, BaseRow);

  return (
    <ParserComponent
      {...rest}
      cells={cells}
      rows={rows}
      onRowSelectionChange={onRowSelectionChange}
    >
      {children}
    </ParserComponent>
  );
};

export type { ITableProps };
export { Table };
