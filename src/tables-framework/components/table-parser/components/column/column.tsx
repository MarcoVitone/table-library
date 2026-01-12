import type { FC, ReactNode } from "react";
import type {
  ILinkConfig,
  ILinkObject,
  IFilterConfig,
} from "../../../../defines/common.types";

interface IColumnProps {
  id?: string;
  suffix?: string;
  isHidden?: boolean;
  isResizable?: boolean;
  width?: string | number;
  filterConfig?: IFilterConfig;
  // link config
  link?: ILinkConfig<ILinkObject>;
  children: ReactNode;
}

const Column: FC<IColumnProps> = () => {
  return null;
};

export type { IColumnProps };
export { Column };
