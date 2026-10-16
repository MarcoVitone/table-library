import { createContext } from "react";
import type { TTableRendererAPI } from "../../defines/api.types";

export const defaultAPI = {
  tableLayout: null,
  columnsLayout: null,
  setColumnsLayout: null,
  sorting: null,
  setSorting: null,
  filtering: null,
  setFiltering: null,
  pagination: null,
  setPagination: null,
  resetLayout: null,
  exportCSV: null,
  exportJSON: null,
  rowsStatus: null,
  setRowsStatus: null,
  source: null,
  stickyHeader: true,
  enableColumnFilters: false,
};

export const TableContext = createContext<TTableRendererAPI>(defaultAPI);

