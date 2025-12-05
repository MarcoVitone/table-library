import type { TSortDirection } from "../../components/cells/sorting-cell/sorting-cell";

interface IQueryParams {
  offset?: number;
  limit?: number;
  filters?: Record<string, unknown>;
  sorting?: {
    sortBy: string;
    sortDirection: TSortDirection;
  };
  extended?: boolean;
}

const defaultQueryParams: IQueryParams = {
  offset: 1,
  limit: 10,
  sorting: { sortBy: "createdAt", sortDirection: "DESC" },
  filters: {},
};

const buildQueryParams = (params: IQueryParams) => {
  // We are grouping all search params in the same object because we want a
  // query string like ?code=123&sortBy=createdAt. Otherwise we will have a
  // query string like ?filters.code=123&sorting.sortBy=createdAt ecc.
  const queryParams = {
    ...params,
    ...params.filters,
    ...params.sorting,
  };

  // We have to remove filters and sorting objects to clean the final object.
  delete queryParams.filters;
  delete queryParams.sorting;

  return queryParams;
};

export type { IQueryParams };
export { buildQueryParams, defaultQueryParams };
