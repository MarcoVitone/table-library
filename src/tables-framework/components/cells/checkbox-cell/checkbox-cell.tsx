import type { ChangeEvent, FC } from "react";
import { useCallback, useMemo } from "react";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { useTable } from "@/tables-framework/hooks/use-table/use-table.ts";
import {
  type TTableCheckboxProps,
  TableCheckbox,
} from "@/tables-framework/components/table-sub-components/check-box/check-box.tsx";

interface ICheckboxCellProps extends IBaseCellProps {
  onChange?: TTableCheckboxProps["onChange"];
  disabled?: TTableCheckboxProps["disabled"];
  showHeaderCheckbox?: boolean;
  onCellChange?: () => void;
}

const CheckboxCell: FC<ICheckboxCellProps> = ({
  onChange,
  disabled = false,
  area,
  data,
  showHeaderCheckbox = true,
  // Intercepting onCellChange to avoid passing it to DOM if it bubbles here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCellChange,
  ...rest
}) => {
  const {
    setRowStatus,
    rowStatus,
    selectAllRows,
    clearSelectedRows,
    selectedRows,
    source,
    stickyHeader,
  } = useTable(data);

  const onChangeHandler = useCallback<
    (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  >(
    (event, checked) => {
      if (area === "header") {
        if (checked) {
          selectAllRows();
        } else {
          clearSelectedRows();
        }
      } else {
        if (setRowStatus) {
          setRowStatus({ isSelected: checked });
        }
      }

      if (onChange) {
        onChange(event, checked);
      }
    },
    [area, clearSelectedRows, onChange, selectAllRows, setRowStatus]
  );

  const checked = useMemo(() => {
    if (area === "header") {
      const totalRows = source?.body?.rows?.length || 0;
      const selectedCount = selectedRows?.length || 0;
      return totalRows > 0 && selectedCount === totalRows;
    } else {
      return !!rowStatus && rowStatus.isSelected;
    }
  }, [area, rowStatus, selectedRows, source?.body?.rows?.length]);

  if (area === "header" && !showHeaderCheckbox) {
    return <BaseCell {...rest} area={area} data={data} variant={"body"} />;
  }

  return (
    <BaseCell
      {...rest}
      area={area}
      data={data}
      variant={"body"}
      isStickyCheckbox={area === "header" && showHeaderCheckbox && stickyHeader}
    >
      <TableCheckbox
        id={data.row.source.id}
        onChange={onChangeHandler}
        checked={checked}
        disabled={disabled}
      />
    </BaseCell>
  );
};

export type { ICheckboxCellProps };
export { CheckboxCell };
