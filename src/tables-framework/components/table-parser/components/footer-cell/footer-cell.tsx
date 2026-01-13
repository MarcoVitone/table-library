import type {
  IUnknownProps,
  TAggregator,
  TSingleCell,
} from "@/tables-framework/defines/common.types";

interface IFooterCellProps<T = IUnknownProps> {
  aggregator?: TAggregator;
  cell?: TSingleCell<T>;
}

function FooterCell<T>(props: IFooterCellProps<T>): null;

function FooterCell() {
  return null;
}

export type { IFooterCellProps };
export { FooterCell };
