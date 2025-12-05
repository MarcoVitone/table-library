import type { FC, ReactNode } from "react";

interface IColumnProps {
  suffix?: string;
  isHidden?: boolean;
  isResizable?: boolean;
  width?: string | number;
  children: ReactNode;
}

const Column: FC<IColumnProps> = () => {
  return null;
};

export type { IColumnProps };
export { Column };
