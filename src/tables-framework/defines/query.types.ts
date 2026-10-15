import type { TFiltering, TSorting } from "./common.types";

export interface ITableQuery {
  page: number;
  pageSize: number;
  sorting: TSorting;
  filters: TFiltering;
}

export interface ITableQueryProps {
  /** Server mode never filters, sorts or paginates the supplied data locally. */
  dataMode?: "client" | "server";
  /** Controlled query. Update it in onQueryChange. */
  query?: ITableQuery;
  defaultQuery?: Partial<ITableQuery>;
  onQueryChange?: (query: ITableQuery) => void;
  /** Total matching records returned by the server, before pagination. */
  totalItems?: number;
}
