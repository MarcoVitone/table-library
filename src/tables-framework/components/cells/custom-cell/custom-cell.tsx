import type { ElementType, FC } from "react";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";

interface ICustomCellProps extends IBaseCellProps {
  component?: ElementType;
}

const CustomCell: FC<ICustomCellProps> = ({
  component: Component,
  data,
  ...rest
}) => {
  return (
    <BaseCell data={data} {...rest}>
      {Component ? <Component data={data} {...rest} /> : null}
    </BaseCell>
  );
};

export type { ICustomCellProps };
export { CustomCell };
