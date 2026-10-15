import type { ElementType } from "react";
import type { IBaseCellProps } from "../components/cells/base-cell/base-cell";
import type { IActionsCellProps } from "../components/cells/actions-cell/actions-cell";
import type { ICheckboxCellProps } from "../components/cells/checkbox-cell/checkbox-cell";
import type { IInputCellProps } from "../components/cells/input-cell/input-cell";
import type { IAutocompleteCellProps, TAutocompleteOption } from "../components/cells/autocomplete-cell.tsx/autocomplete-cell";
import type { ICurrencyCellProps } from "../components/cells/currency-cell/currency-cell";
import type { IStatusCellProps } from "../components/cells/status-cell/status-cell";
import type { IDateCellProps } from "../components/cells/date-cell/date-cell";
import type { ICellProps, IFilterConfig, ILinkConfig } from "./common.types";
import type { ICellEditing } from "./editing.types";

type UserProps<P> = Partial<Omit<P, keyof ICellProps | "onCellChange">>;
type EditorProps<P, T, V> = Omit<UserProps<P>, keyof ICellEditing<T, V>> & ICellEditing<T, V>;
interface CommonColumn<T> {
  id: string;
  label: string;
  dataKey?: string;
  width?: string | number;
  minWidth?: string | number;
  headerProps?: UserProps<IBaseCellProps>;
  queryParam?: string;
  onHeaderClick?: (dataKey: string) => void;
  link?: ILinkConfig<T>;
  fixed?: boolean;
  isResizable?: boolean;
  hideable?: boolean;
  draggable?: boolean;
  filterConfig?: IFilterConfig;
}
type Variants<T> =
  | { type?: "text" | "number"; bodyProps?: UserProps<IBaseCellProps> }
  | { type: "action"; bodyProps?: UserProps<IActionsCellProps<T>> }
  | { type: "checkbox"; bodyProps?: UserProps<ICheckboxCellProps> }
  | { type: "date"; bodyProps?: UserProps<IDateCellProps> }
  | ({ type: "input"; bodyProps?: EditorProps<IInputCellProps, T, string | number | boolean> }
      & Pick<IInputCellProps, "inputType" | "inputHeight" | "inputWidth"> & ICellEditing<T, string | number | boolean>)
  | ({ type: "currency"; bodyProps?: UserProps<ICurrencyCellProps> }
      & Pick<ICurrencyCellProps, "currencySymbol" | "symbolPosition" | "decimals">)
  | ({ type: "status"; bodyProps?: UserProps<IStatusCellProps> }
      & Pick<IStatusCellProps, "statusConfig" | "renderStatus">)
  | ({ type: "autocomplete"; bodyProps?: EditorProps<IAutocompleteCellProps, T, TAutocompleteOption | null>;
      autocompleteOptions?: TAutocompleteOption[] }
      & Pick<IAutocompleteCellProps, "getOptionLabel" | "isOptionEqualToValue" | "disableClearable">
      & ICellEditing<T, TAutocompleteOption | null>)
  | { type: "custom"; component: ElementType; bodyProps?: UserProps<IBaseCellProps> & Record<string, unknown> };

type UnionKeys<T> = T extends unknown ? keyof T : never;
type StrictUnion<T, All = T> = T extends unknown
  ? T & Partial<Record<Exclude<UnionKeys<All>, keyof T>, never>> : never;

/** Column-specific props are inferred from `type`; shared styling stays available. */
export type IColumnConfig<T = Record<string, unknown>> = CommonColumn<T> & StrictUnion<Variants<T>>;
