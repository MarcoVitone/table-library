import type { IColumnLayout } from "./common.types";
import type { ITableQuery } from "./query.types";
import type { TPersistenceStorage } from "../components/pagination/pagination.types";

export interface ITableViewState extends Pick<ITableQuery, "sorting" | "filters" | "pageSize" | "search"> {
  columnsLayout: IColumnLayout[];
}

export interface ISavedTableView {
  id: string;
  name: string;
  state: ITableViewState;
}

export interface ISavedViewsConfig {
  /** Unique table/account namespace. */
  key: string;
  storage?: TPersistenceStorage | false;
  /** Controlled list: storage is delegated to the owner. */
  views?: ISavedTableView[];
  defaultViews?: ISavedTableView[];
  onViewsChange?: (views: ISavedTableView[]) => void;
  onViewApply?: (view: ISavedTableView) => void;
}
