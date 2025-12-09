import type { FC, ReactNode } from "react";
import type { ILinkObject } from "../../../../defines/common.types";

interface IColumnProps {
  suffix?: string;
  isHidden?: boolean;
  isResizable?: boolean;
  width?: string | number;
  // link config
  link?: import("../../../../defines/common.types").ILinkConfig<ILinkObject>;
  children: ReactNode;
}

const Column: FC<IColumnProps> = () => {
  return null;
};

export type { IColumnProps };
export { Column };
