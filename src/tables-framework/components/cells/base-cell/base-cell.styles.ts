import { css, styled } from "@mui/material/styles";

import type {
  TAlignment,
  TtextTransform,
} from "../../../defines/common.types.ts";
import type { IStyleFromProps } from "../../../theme/common.types.ts";
import { convertHexToRGBA } from "../../../utils/index.ts";

interface IBaseCellProps {
  noLeft?: boolean;
  noRight?: boolean;
  noTop?: boolean;
  noBorder?: boolean;
  borderColor?: string;
  bold?: boolean;
  textPosition?: TAlignment;
  textTransform?: TtextTransform;
  fontColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  padding?: string;
  overFlow?: string;
  textOverflow?: string;
  isSorted?: boolean;
  backgroundColorSort?: string;
  isSortActive?: boolean;
}

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) =>
    prop !== "noLeft" &&
    prop !== "noRight" &&
    prop !== "noTop" &&
    prop !== "noBorder" &&
    prop !== "borderColor" &&
    prop !== "bold" &&
    prop !== "textPosition" &&
    prop !== "textTransform" &&
    prop !== "fontColor" &&
    prop !== "backgroundColor" &&
    prop !== "fontSize" &&
    prop !== "padding" &&
    prop !== "overFlow" &&
    prop !== "textOverflow" &&
    prop !== "isSorted" &&
    prop !== "backgroundColorSort" &&
    prop !== "isSortActive",
};

const BaseCellComponent = styled(
  "td",
  stylesFromProps
)<IBaseCellProps>(
  ({
    noLeft,
    noRight,
    noTop,
    noBorder,
    borderColor,
    bold,
    textPosition = "left",
    textTransform,
    fontColor,
    backgroundColor,
    fontSize,
    padding,
    overFlow,
    textOverflow,
    isSorted,
    backgroundColorSort,
    isSortActive,
    theme,
  }) => {
    return css({
      border: noBorder
        ? "none"
        : `1px solid ${convertHexToRGBA(theme?.palette?.primary?.dark, 0.6)}`,
      padding: padding ? padding : "0.1rem 0.5rem",
      color: fontColor || theme.palette.primary.dark,
      borderLeft: noLeft ? "none" : undefined,
      borderRight: noRight ? "none" : undefined,
      borderTop: noTop ? "none" : undefined,
      borderColor: borderColor ? borderColor : undefined,
      backgroundColor: isSorted
        ? backgroundColorSort
        : backgroundColor || "transparent",
      fontWeight: bold ? "bold" : "normal",
      textAlign: textPosition,
      textTransform: textTransform,
      fontSize: fontSize || "1rem",
      fontFamily: theme.typography.body1.fontFamily,
      ...(overFlow ? { overflow: overFlow } : {}),
      ...(textOverflow ? { textOverflow } : {}),
      "& .sort-icon": {
        opacity: isSortActive ? 1 : 0,
        transition: "opacity 0.2s",
      },
      "&:hover .sort-icon": {
        opacity: 1,
      },
    });
  }
);

export { BaseCellComponent };
