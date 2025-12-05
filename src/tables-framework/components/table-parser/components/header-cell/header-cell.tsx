import type {
  IUnknownProps,
  TSingleCell,
} from "../../../../defines/common.types";

interface IHeaderCellProps<T = IUnknownProps> {
  label: string;
  cell?: TSingleCell<T>;
}

function HeaderCell<T>(props: IHeaderCellProps<T>): null;

function HeaderCell() {
  return null;
}

export type { IHeaderCellProps };
export { HeaderCell };
