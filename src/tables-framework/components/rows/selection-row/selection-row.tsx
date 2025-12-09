import type { FC } from "react";
import { useCallback } from "react";
import type { IRowProps } from "../../../defines/common.types.ts";
import { BaseTr } from "./selection-row.styles.ts";
import { useTable } from "../../../hooks/use-table/use-table.ts";

interface ISelectionRowProps extends IRowProps {
  singleSelect: boolean;
  onRowSelected?: (id: string) => void;
}

const SelectionRow: FC<ISelectionRowProps> = ({
  singleSelect,
  onRowSelected,
  data,
  children,
}) => {
  const { rowStatus, setRowStatus, clearSelectedRows } = useTable(data);

  const isSelected = !!rowStatus && rowStatus.isSelected;

  const isLoading = !!rowStatus && rowStatus.state === "pending";

  const onRowSelectHandler = useCallback(() => {
    if (setRowStatus) {
      if (singleSelect) {
        clearSelectedRows();
      }
      setRowStatus({ isSelected: true });
    }
    onRowSelected?.(data.source.id);
  }, [
    setRowStatus,
    singleSelect,
    clearSelectedRows,
    onRowSelected,
    data.source.id,
  ]);

  const onRowUnselectHandler = useCallback(() => {
    if (setRowStatus) {
      setRowStatus({ isSelected: false });
    }
    onRowSelected?.("");
  }, [setRowStatus, onRowSelected]);

  return (
    <BaseTr
      isSelected={isSelected}
      isLoading={isLoading}
      onClick={isSelected ? onRowUnselectHandler : onRowSelectHandler}
    >
      {children}
    </BaseTr>
  );
};

export type { ISelectionRowProps };
export { SelectionRow };
