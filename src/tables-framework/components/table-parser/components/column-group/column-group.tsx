import type { FC, ReactNode } from "react";

interface IColumnGroupProps {
  groupKey: string;
  label: string;
  children: ReactNode;
}

const ColumnGroup: FC<IColumnGroupProps> = () => {
  return null;
};

export type { IColumnGroupProps };
export { ColumnGroup };
