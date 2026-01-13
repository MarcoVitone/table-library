import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { IStyleFromProps } from "@/tables-framework/theme/common.types";
import type { IChipProps } from "./chip";
import { Chip as MuiChip } from "@mui/material";

type TChipStyleProps = Pick<
  IChipProps,
  "backgroundColor" | "textColor" | "iconColor"
>;

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) =>
    prop !== "backgroundColor" && prop !== "textColor" && prop !== "iconColor",
};

const Chip = styled(
  MuiChip,
  stylesFromProps
)<TChipStyleProps>(({ backgroundColor, textColor, iconColor }) =>
  css({
    backgroundColor: backgroundColor,
    color: textColor,
    letterSpacing: "0.4px",
    paddingRight: "var(--borderRadius, 0px)",
    height: "1.25rem",

    ".MuiChip-icon": {
      color: iconColor,
      height: "0.8rem",
      width: "0.8rem",
    },
  })
);

export { Chip };
