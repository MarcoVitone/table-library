import type { FC } from "react";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";

interface INumCellProps extends IBaseCellProps {
  children: number | string;
}

const NumCell: FC<INumCellProps> = ({ children, ...rest }) => {
  return <BaseCell {...rest}>{children}</BaseCell>;
};

export type { INumCellProps };
export { NumCell };
