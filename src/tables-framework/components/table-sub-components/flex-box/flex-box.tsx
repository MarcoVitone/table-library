import type { FC } from "react";
import type { BoxProps } from "@mui/material";
import { Box } from "@mui/material";

type TFlexBoxGap = string | number;

type TFlexBoxDirection = "row" | "row-reverse" | "column" | "column-reverse";

type TFlexBoxJustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

type TFlexBoxAlignItems =
  | "stretch"
  | "flex-start"
  | "flex-end"
  | "center"
  | "baseline";

type TFlexBoxProps = {
  direction?: TFlexBoxDirection;
} & BoxProps;

const FlexBox: FC<TFlexBoxProps> = ({ direction = "row", ...props }) => {
  return (
    <Box display={"flex"} flexDirection={direction} {...props}>
      {props.children}
    </Box>
  );
};

export type {
  TFlexBoxAlignItems,
  TFlexBoxDirection,
  TFlexBoxGap,
  TFlexBoxJustifyContent,
};
export { FlexBox };
