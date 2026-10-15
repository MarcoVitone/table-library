import type { ITableViewState, ISavedTableView } from "../../defines/saved-views.types";
import { serializeTableState as encode } from "../table-state/table-state";

function decode(value: string): unknown {
  return JSON.parse(value, (_key, item) => {
    if (item && typeof item === "object" && Object.keys(item).length === 1 && item.$tableRegExp) {
      const { source, flags } = item.$tableRegExp;
      if (typeof source !== "string" || typeof flags !== "string") throw new Error("Invalid regular expression");
      return new RegExp(source, flags);
    }
    return item;
  });
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const width = (value: unknown) => value == null || typeof value === "string" || (typeof value === "number" && Number.isFinite(value) && value >= 0);
const scalar = (value: unknown) => typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value));

export function isTableViewState(value: unknown): value is ITableViewState {
  if (!record(value) || !Number.isInteger(value.pageSize) || (value.pageSize as number) < 1
    || (value.search !== undefined && typeof value.search !== "string")) return false;
  if (!Array.isArray(value.columnsLayout) || !value.columnsLayout.every(column => record(column)
    && typeof column.id === "string" && record(column.props)
    && (column.props.isHidden === undefined || typeof column.props.isHidden === "boolean")
    && width(column.props.width) && width(column.props.savedWidth))) return false;
  if (new Set(value.columnsLayout.map(column => column.id)).size !== value.columnsLayout.length) return false;
  if (!Array.isArray(value.sorting) || !value.sorting.every(sort => record(sort) && typeof sort.key === "string"
    && (sort.dir === "asc" || sort.dir === "desc") && typeof sort.isServerSide === "boolean")) return false;
  return Array.isArray(value.filters) && value.filters.every(filter => record(filter) && typeof filter.key === "string"
    && ["eq", "ne", "gt", "lt", "gte", "lte", "match", "exists", "regexp", "in"].includes(String(filter.op))
    && (scalar(filter.val) || filter.val instanceof RegExp || (Array.isArray(filter.val) && filter.val.every(scalar))));
}

export function serializeSavedViews(views: ISavedTableView[]): string {
  return encode({ version: 1, views });
}

export function parseSavedViews(text: string): ISavedTableView[] {
  const value = decode(text);
  if (!record(value) || value.version !== 1 || !Array.isArray(value.views)
    || !value.views.every(view => record(view) && typeof view.id === "string" && !!view.id
      && typeof view.name === "string" && !!view.name.trim() && isTableViewState(view.state))
    || new Set(value.views.map(view => view.id)).size !== value.views.length) {
    throw new Error("Invalid saved views");
  }
  return value.views as ISavedTableView[];
}

export function cloneTableViewState(state: ITableViewState): ITableViewState {
  return decode(encode(state)) as ITableViewState;
}

export function tableViewSignature(state: ITableViewState): string {
  // Canonical property order also handles views supplied by external storage.
  return encode({ columnsLayout: state.columnsLayout.map(({ id, props }) => ({ id, props: {
    isHidden: props.isHidden ?? false, width: props.width ?? null, savedWidth: props.savedWidth ?? null,
  } })), sorting: state.sorting, filters: state.filters, search: state.search ?? "", pageSize: state.pageSize });
}

export function reconcileTableViewState(state: ITableViewState, columns: { id: string; dataKey?: string; queryParam?: string }[]): ITableViewState {
  const current = new Map(columns.map(column => [column.id, column]));
  const saved = state.columnsLayout.filter(column => current.has(column.id));
  const savedIds = new Set(saved.map(column => column.id));
  const keys = new Set(columns.flatMap(column => [column.id, column.dataKey ?? column.id, column.queryParam ?? column.dataKey ?? column.id]));
  return cloneTableViewState({ ...state,
    columnsLayout: [...saved, ...columns.filter(column => !savedIds.has(column.id))
      .map(column => ({ id: column.id, props: { isHidden: undefined, width: undefined } }))],
    sorting: state.sorting.filter(sort => keys.has(sort.key)),
    filters: state.filters.filter(filter => keys.has(filter.key)),
  });
}
