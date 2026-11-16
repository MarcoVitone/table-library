import { createContext, useContext, useMemo, type AriaAttributes, type HTMLAttributes } from "react";
import type { ICell, IColumn, IRow } from "../defines/common.types";

/** Stable names for the library's semantic elements and controls. */
export type TAccessibilitySlot =
  | "table" | "header" | "body" | "footer" | "row" | "cell" | "scrollRegion" | "virtualSpacer"
  | "sortButton" | "dragHandle" | "dragStatus" | "resizeHandle" | "collapseButton"
  | "filterButton" | "filterInput" | "filterResetButton" | "dialog"
  | "dialogTitle" | "filterLabel" | "columnLabel" | "globalSearchLabel" | "savedViewSelectLabel" | "savedViewNameLabel"
  | "resetLayoutButton" | "configureColumnsButton" | "closeConfigButton"
  | "moveColumnUpButton" | "moveColumnDownButton" | "columnVisibility"
  | "selectAllCheckbox" | "rowCheckbox" | "rowAction" | "cellInput" | "cellEditor" | "cellError" | "cellSaving"
  | "autocompleteInput" | "autocompleteList" | "autocompleteOption" | "autocompleteEmpty"
  | "autocompleteClearButton" | "autocompleteToggleButton"
  | "tableState" | "retryButton" | "globalSearchInput" | "globalSearchClearButton"
  | "bulkActions" | "bulkToolbar" | "bulkSelectionStatus" | "bulkAction" | "bulkClearButton"
  | "bulkPending" | "bulkError" | "bulkErrorCloseButton"
  | "savedViews" | "savedViewSelect" | "savedViewName" | "savedViewStatus" | "savedViewError"
  | "savedViewApplyButton" | "savedViewSaveButton" | "savedViewUpdateButton" | "savedViewDeleteButton"
  | "savedViewShareButton" | "savedViewLinkLabel" | "savedViewLink"
  | "pasteOpenButton" | "pasteRowLabel" | "pasteRowSelect" | "pasteColumnLabel" | "pasteColumnSelect"
  | "pasteTextLabel" | "pasteText" | "pastePreviewButton" | "pasteApplyButton" | "pasteCancelButton" | "pasteStatus" | "pasteError"
  | "pastePreviewTable"
  | "pasteContent" | "pasteHelp" | "pastePreviewHeader" | "pastePreviewBody" | "pastePreviewRow" | "pastePreviewCell"
  | "resetConfigButton" | "goToPageButton"
  | "pagination" | "pageSizeSelect" | "pageButton" | "pageNavigationButton" | "goToPageInput"
  | "button" | "checkbox" | "chip" | "chipDeleteButton" | "cellLink" | "icon"
  | "expandedDetails" | "expandedSummary" | "loadMoreButton" | "loadMoreStatus" | "loadMoreEnd";

export interface IAccessibilityContext {
  cell?: ICell;
  row?: IRow;
  column?: IColumn;
  area?: "header" | "body" | "footer";
  index?: number;
  actionId?: string;
  label?: string;
  count?: number;
  position?: number;
  columnId?: string;
  rowId?: string;
}

/** Props reach the native element, including explicit undefined values to remove defaults. */
export type TAccessibilityProps = HTMLAttributes<HTMLElement> & AriaAttributes & {
  scope?: string;
  headers?: string;
  htmlFor?: string;
  autoFocus?: boolean;
  focusable?: boolean | "true" | "false";
  [attribute: `data-${string}`]: string | number | boolean | undefined;
};
type TSlotProps = TAccessibilityProps | ((context: IAccessibilityContext, defaults: Readonly<TAccessibilityProps>) => TAccessibilityProps);
export type TAccessibilityMessage = "columnMoved" | "selectionCount" | "saving" | "bulkPending" | "autocompleteEmpty";

export interface ITableAccessibility {
  /** Keep native HTML semantics, but omit generated ARIA, roles, titles and tab stops. Default: true. */
  useDefaults?: boolean;
  dialog?: {
    /** Native modal behavior (including browser focus containment). Default: true. */
    modal?: boolean;
    /** Additional library Tab-key containment. Default: true. */
    trapFocus?: boolean;
    /** Explicit library restoration to the previously focused element. Default: true. */
    restoreFocus?: boolean;
  };
  /** Overrides are applied after library defaults. Callbacks receive the current row/column/state. */
  slotProps?: Partial<Record<TAccessibilitySlot, TSlotProps>>;
  /** Final override, after slotProps. Return undefined to keep the resolved props. */
  getProps?: (slot: TAccessibilitySlot, defaults: Readonly<TAccessibilityProps>, context: IAccessibilityContext) => TAccessibilityProps | undefined;
  /** Text announced by live regions. Empty strings suppress the corresponding default text. */
  messages?: Partial<Record<TAccessibilityMessage, string | ((context: IAccessibilityContext) => string)>>;
}

export const AccessibilityContext = /* @__PURE__ */ createContext<ITableAccessibility | undefined>(undefined);
export const ElementContext = /* @__PURE__ */ createContext<IAccessibilityContext>({});

export function resolveAccessibilityProps<P extends object>(config: ITableAccessibility | undefined, slot: TAccessibilitySlot, defaults: P, context: IAccessibilityContext = {}): P {
  const base = config?.useDefaults === false ? Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
    [key, /^(aria-|role$|scope$|headers$|tabIndex$|title$|autoFocus$|focusable$)/.test(key) ? undefined : value])) as P : defaults;
  const override = config?.slotProps?.[slot];
  const props = { ...base, ...(typeof override === "function" ? override(context, base as TAccessibilityProps) : override) };
  return { ...props, ...config?.getProps?.(slot, props, context) };
}

export function useTableAccessibility() {
  const config = useContext(AccessibilityContext);
  const inherited = useContext(ElementContext);
  return useMemo(() => {
    const withContext = (context: IAccessibilityContext) => {
      const merged = { ...inherited, ...context };
      return { columnId: merged.column?.id, rowId: merged.row?.source?.id, ...merged };
    };
    return {
      getProps: <P extends object,>(slot: TAccessibilitySlot, defaults: P, context: IAccessibilityContext = {}) => {
        return resolveAccessibilityProps(config, slot, defaults, withContext(context));
      },
      dialog: config?.dialog,
      message: (key: TAccessibilityMessage, fallback: string, context: IAccessibilityContext = {}) => {
        const message = config?.messages?.[key];
        return typeof message === "function" ? message(withContext(context)) : message ?? (config?.useDefaults === false ? "" : fallback);
      },
    };
  }, [config, inherited]);
}

