import type { CSSProperties, ReactElement } from "react";

export interface IStatusStyle {
  label?: string;
  backgroundColor: string;
  textColor: string;
  iconColor?: string;
  iconChip?: ReactElement;
  style?: CSSProperties;
}

export type TStatusConfig<T extends string = string> = Record<T, IStatusStyle>;
