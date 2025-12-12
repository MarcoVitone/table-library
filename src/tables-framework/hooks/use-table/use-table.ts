import { useContext, useMemo, useCallback } from "react";
import { TableContext } from "../../components/table-renderer/table-renderer";
import type {
  TFullTableAPI,
  TSetColumnLayout,
  TSetRowStatus,
  TClearSelectedRows,
  TSelectAllRows,
} from "../../defines/api.types";
import type {
  ICell,
  IRow,
  IColumnLayout,
  IRowStatus,
  TRowsStatus,
} from "../../defines/common.types";

function useTable(data?: ICell | IRow): TFullTableAPI {
  const {
    tableLayout,
    columnsLayout,
    setColumnsLayout,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination,
    exportCSV,
    exportJSON,
    rowsStatus,
    setRowsStatus,
    source,
    stickyHeader,
  } = useContext(TableContext);

  const columnLayout = useMemo<IColumnLayout | null>(() => {
    const id = data && "column" in data && data.column.id;

    if (columnsLayout && id) {
      return columnsLayout.find((c) => c.id === id) || null;
    } else {
      return null;
    }
  }, [columnsLayout, data]);

  const setColumnLayout = useCallback<TSetColumnLayout>(
    (changer, columnID) => {
      const id = columnID || (data && "column" in data && data.column.id);

      if (setColumnsLayout && id) {
        setColumnsLayout((prevState) => {
          const idx = prevState.findIndex((c) => c.id === id);

          if (idx < 0) {
            console.warn(`COLUMN ${id} NOT FOUND`);
            return prevState;
          }

          const prevItem = prevState[idx];

          const newState = [...prevState];

          if (typeof changer === "function") {
            newState[idx] = { ...prevItem, ...changer(prevItem) };
          } else {
            newState[idx] = { ...prevItem, ...changer };
          }

          return newState;
        });
      }
    },
    [data, setColumnsLayout]
  );

  const rowStatus = useMemo<IRowStatus | null>(() => {
    const id = data && ("row" in data ? data.row.id : data.id);

    if (rowsStatus && id) {
      return rowsStatus[id] || null;
    } else {
      return null;
    }
  }, [data, rowsStatus]);

  const setRowStatus = useCallback<TSetRowStatus>(
    (changer, rowID) => {
      const id = rowID || (data && ("row" in data ? data.row.id : data.id));

      if (setRowsStatus && id) {
        setRowsStatus((prevState) => {
          const prevItem = prevState[id] || {};

          const newState = { ...prevState };

          if (typeof changer === "function") {
            newState[id] = { ...prevItem, ...changer(prevItem) };
          } else {
            newState[id] = { ...prevItem, ...changer };
          }

          return newState;
        });
      }
    },
    [data, setRowsStatus]
  );

  const selectedRows = useMemo<IRow[] | null>(() => {
    if (rowsStatus && source) {
      return Object.entries(rowsStatus).reduce<IRow[]>((acc, [id, status]) => {
        if (status.isSelected) {
          const row = source.body.rows.find((r) => r.id === id);

          if (row) {
            acc.push(row);
          }
        }

        return acc;
      }, []);
    } else {
      return null;
    }
  }, [rowsStatus, source]);

  const clearSelectedRows = useCallback<TClearSelectedRows>(() => {
    if (setRowsStatus) {
      setRowsStatus((prevState) => {
        const newState = { ...prevState };

        return Object.entries(newState).reduce<TRowsStatus>(
          (acc, [id, status]) => {
            acc[id] = {
              ...status,
              isSelected: false,
            };

            return acc;
          },
          {}
        );
      });
    }
  }, [setRowsStatus]);

  const selectAllRows = useCallback<TSelectAllRows>(() => {
    if (setRowsStatus) {
      setRowsStatus((prevState) => {
        const newState = { ...prevState };

        return Object.entries(newState).reduce<TRowsStatus>(
          (acc, [id, status]) => {
            acc[id] = {
              ...status,
              isSelected: true,
            };

            return acc;
          },
          {}
        );
      });
    }
  }, [setRowsStatus]);

  return {
    tableLayout,
    columnsLayout,
    clearSelectedRows,
    setColumnsLayout,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination,
    exportCSV,
    exportJSON,
    rowsStatus,
    setRowsStatus,
    columnLayout,
    setColumnLayout,
    rowStatus,
    setRowStatus,
    selectedRows,
    selectAllRows,
    source,
    stickyHeader,
  };
}

export { useTable };
