import type {
  ComponentType,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";
import type { IColumnProps } from "../components/table-parser/components/column/column.tsx";
import type { IColumnGroupProps } from "../components/table-parser/components/column-group/column-group.tsx";

// *** CORE ***

interface ISorting {
  key: string;
  dir: "asc" | "desc";
  isServerSide: boolean;
}

interface IDatum {
  [k: string]: IDatum | ReactNode;
}

interface IFlatDatum {
  [k: string]: ReactNode;
}

interface IDataSource {
  id: string;
  flat: IFlatDatum;
  full: IDatum;
}

interface IDataContainer {
  value: ReactNode;
  source: IDataSource;
}

interface IColumnGroup {
  label: string;
  groupKey: string;
}

interface IColumn {
  id: string;
  label: string;
  dataKey: string;
  posX: number;
  cells: {
    header: TCellCombo | null;
    body: TCellCombo | null;
    footer: TCellCombo | null;
  };
  rows: {
    header: TRowCombo | null;
    body: TRowCombo | null;
    footer: TRowCombo | null;
  };
  aggregator: TAggregator | null;
  groups: IColumnGroup[];
  data: IDataContainer[];
  props: {
    isHidden: boolean;
    isResizable: boolean;
    width: string | number | null;
  };
  link?: ILinkConfig<ILinkObject>;
}

export type TRouterType = "native" | "react-router" | "nextjs" | "custom";

export interface ILinkObject {
  id?: string | number;
  label?: string;
  [k: string]: unknown;
}

export interface IRowNavigationConfig<T = ILinkObject> {
  baseUrl: string;
  targetKey?: keyof T;
  onNavigate?: (path: string) => void;
  target?: string;
}

export interface ILinkConfig<T = ILinkObject> {
  types: TRouterType;
  component?: ElementType;
  to: (row: T) => string | object;
  target?: string;
  className?: string;
  style?: import("react").CSSProperties;
  textDecoration?: "none" | "underline" | "overline" | "line-through" | "blink";
}

type TAggregator = (column: IColumn) => ReactNode;

interface ICell extends Record<string, unknown> {
  id: string;
  value: ReactNode;
  posX: number;
  posY: number;
  colSpan: number;
  column: IColumn;
  row: IRow;
  component: TCellCombo | null;
}

type TArea = "header" | "body" | "footer";

interface IRow {
  id: string;
  posY: number;
  cells: ICell[];
  size: number;
  source: IDataSource;
  area: TArea;
  component: TRowCombo | null;
  value?: string | boolean | number;
}

interface IRowGroup {
  rows: IRow[];
}

interface ISource {
  header: IRowGroup;
  body: IRowGroup;
  footer: IRowGroup;
  columns: IColumn[];
}

// *** LAYOUT ***

interface IColumnLayout {
  id: string;
  props: {
    isHidden: boolean | undefined;
    width: string | number | null | undefined;
  };
}

type TColumnsLayout = IColumnLayout[];

type TSorting = ISorting[];

interface IFilter {
  key: string;
  op: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "match" | "exists" | "regexp";
  val: string | number | RegExp | boolean;
}

type TFiltering = IFilter[];

interface IPagination {
  limit: number | null;
  offset: number;
  position?: "top" | "bottom";
  alignment?: "left" | "center" | "right";
}

interface ITableLayout {
  columnsLayout?: IColumnLayout[];
  sorting?: TSorting;
  filtering?: TFiltering;
  pagination?: IPagination;
}

// *** JSX ***

type TAllowedJSX = ReactElement<IColumnProps> | ReactElement<IColumnGroupProps>;

type TJSX = TAllowedJSX | TAllowedJSX[] | null;

// *** CUSTOM ELEMENTS ***

interface IUnknownProps {
  [k: string]: unknown;
}

interface ICellProps {
  index: number;
  colSpan: number;
  data: ICell;
  area: TArea;
  children: ReactNode;
}

interface IRowProps {
  data: IRow;
  children: ReactNode;
}

type TElementCombo = [ElementType, Record<string, unknown>];

type TCellCombo<T = IUnknownProps> = [
  ElementType | ComponentType<T>,
  Omit<T, keyof ICellProps>
];

type TRowCombo<T = IUnknownProps> = [
  ElementType | ComponentType<T>,
  Omit<T, keyof IRowProps>
];

type TSingleElement = ElementType | TElementCombo;

type TSingleCell<T = IUnknownProps> = ElementType | TCellCombo<T>;

type TSingleRow<T = IUnknownProps> = ElementType | TRowCombo<T>;

interface IMultipleElements {
  header: TSingleElement;
  body: TSingleElement;
  footer: TSingleElement | undefined;
}

interface IMultipleCells<
  T1 = IUnknownProps,
  T2 = IUnknownProps,
  T3 = IUnknownProps
> {
  header: TSingleCell<T1>;
  body: TSingleCell<T2>;
  footer: TSingleCell<T3> | undefined;
}

interface IMultipleRows<
  T1 = IUnknownProps,
  T2 = IUnknownProps,
  T3 = IUnknownProps
> {
  header: TSingleRow<T1>;
  body: TSingleRow<T2>;
  footer: TSingleRow<T3> | undefined;
}

// *** HELPERS ***

type TNonNullable<T> = {
  [TKey in keyof T]: NonNullable<T[TKey]>;
};

// *** OTHER ***

interface IRowStatus {
  state: "ready" | "pending";
  isPinned: boolean;
  isSelected: boolean;
}

type TRowsStatus = Record<string, IRowStatus>;

export type {
  ICell,
  ICellProps,
  IColumn,
  IColumnGroup,
  IColumnLayout,
  IDataContainer,
  IDataSource,
  IDatum,
  IFilter,
  IFlatDatum,
  IMultipleCells,
  IMultipleElements,
  IMultipleRows,
  IPagination,
  IRow,
  IRowGroup,
  IRowProps,
  IRowStatus,
  ISorting,
  ISource,
  ITableLayout,
  IUnknownProps,
  TAggregator,
  TAllowedJSX,
  TCellCombo,
  TColumnsLayout,
  TElementCombo,
  TFiltering,
  TJSX,
  TNonNullable,
  TRowCombo,
  TRowsStatus,
  TSingleCell,
  TSingleElement,
  TSingleRow,
  TSorting,
  TAlignment,
  TDirection,
  TtextTransform,
};

type TDirection = "row" | "row-reverse";

type TAlignment = "left" | "right" | "center";

type TtextTransform = "capitalize" | "uppercase" | "lowercase" | "none";

type TBorderStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset"
  | "none"
  | "hidden";

interface IBorderConfig {
  show?: boolean;
  color?: string;
  width?: string;
  style?: TBorderStyle;
}

export type { IBorderConfig, TBorderStyle };
