import type { ChangeEvent, FC } from "react";
import { useCallback, useMemo } from "react";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import { useTable } from "../../../hooks/use-table/use-table.ts";
import {
  type TTableCheckboxProps,
  TableCheckbox,
} from "../../table-sub-components/check-box/check-box.tsx";

interface ICheckboxCellProps extends IBaseCellProps {
  onChange?: TTableCheckboxProps["onChange"];
  disabled?: TTableCheckboxProps["disabled"];
}

const CheckboxCell: FC<ICheckboxCellProps> = ({
  onChange,
  disabled = false,
  area,
  data,
  ...rest
}) => {
  const {
    setRowStatus,
    rowStatus,
    selectAllRows,
    clearSelectedRows,
    selectedRows,
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
    [area, clearSelectedRows, data, onChange, selectAllRows, setRowStatus]
  );

  const checked = useMemo(() => {
    if (area === "header") {
      return !!selectedRows && !!selectedRows.length;
    } else {
      return !!rowStatus && rowStatus.isSelected;
    }
  }, [area, rowStatus, selectedRows]);

  return (
    <BaseCell {...rest} area={area} data={data} variant={"body"}>
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
