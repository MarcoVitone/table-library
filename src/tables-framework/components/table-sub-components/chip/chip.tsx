import type { CSSProperties, FC, ReactElement } from "react";
import { Circle } from "@mui/icons-material";
import type { ChipProps as MUIChipProps } from "@mui/material";
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

const TableStatusChip: FC<IChipProps & Omit<MUIChipProps, "label">> = ({
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
