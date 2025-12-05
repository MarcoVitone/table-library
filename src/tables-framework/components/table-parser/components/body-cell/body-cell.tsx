import type {
  IUnknownProps,
  TSingleCell,
} from "../../../../defines/common.types";

interface IBodyCellProps<T = IUnknownProps> {
  dataKey: string;
  cell?: TSingleCell<T>;
}

function BodyCell<T>(props: IBodyCellProps<T>): null;

function BodyCell() {
  return null;
}

export type { IBodyCellProps };
export { BodyCell };
