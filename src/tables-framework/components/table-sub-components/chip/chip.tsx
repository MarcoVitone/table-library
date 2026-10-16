import type { CSSProperties, FC, ReactElement } from "react";
import { Circle } from "@/tables-framework/ui/icons";
import type { ChipProps as NativeChipProps } from "@/tables-framework/ui/controls";
import { Chip } from "./chip.styles.ts";

interface IChipProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconChip?: ReactElement;
  style?: CSSProperties;
  className?: string;
}

const TableStatusChip: FC<IChipProps & Omit<NativeChipProps, "label">> = ({
  label,
  backgroundColor,
  textColor,
  iconColor,
  iconChip,
  style,
  className,
  ...props
}) => {
  return (
    <Chip
      label={label}
      backgroundColor={backgroundColor}
      textColor={textColor}
      iconColor={iconColor}
      icon={iconChip ?? <Circle />}
      style={style}
      className={className}
      {...props}
    />
  );
};

export type { IChipProps };
export { TableStatusChip };
