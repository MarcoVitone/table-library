import { css, styled } from "@mui/material/styles";

import type {
  TAlignment,
  TtextTransform,
  IBorderConfig,
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
  isSticky?: boolean;
  isFirstRow?: boolean;
  fixed?: boolean;
  isSelected?: boolean;
  rowSelectedColor?: string;
  wrapText?: boolean;
  ellipsis?: boolean;
  maxWidth?: string | number;
  borderRight?: IBorderConfig;
  borderBottom?: IBorderConfig;
  borderTop?: IBorderConfig;
  borderLeft?: IBorderConfig;
  stickyLeft?: string;
  isDragging?: boolean;
  draggable?: boolean;
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
    prop !== "isSortActive" &&
    prop !== "showHeaderCheckbox" &&
    prop !== "isSticky" &&
    prop !== "isFirstRow" &&
    prop !== "fixed" &&
    prop !== "fixedColumn" &&
    prop !== "isSelected" &&
    prop !== "rowSelectedColor" &&
    prop !== "wrapText" &&
    prop !== "ellipsis" &&
    prop !== "maxWidth" &&
    prop !== "borderRight" &&
    prop !== "borderBottom" &&
    prop !== "borderTop" &&
    prop !== "borderLeft" &&
    prop !== "stickyLeft" &&
    prop !== "isDragging" &&
    prop !== "draggable",
};

const BaseCellComponent = styled(
  "td",
  stylesFromProps
)<IBaseCellProps>(
  ({
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
    isSticky,
    fixed,
    isSelected,
    rowSelectedColor,
    wrapText,
    ellipsis,
    maxWidth,
    borderRight,
    borderBottom,
    borderTop,
    borderLeft,
    stickyLeft,
    isDragging,
  }) => {
    const defaultBorderColor = convertHexToRGBA(
      theme?.palette?.primary?.dark,
      0.6
    );
    const finalBorderColor = borderColor || defaultBorderColor;
    const selectedStyles = {
      outlineStyle: "none" as const,
      outlineColor: theme.palette.secondary.dark,
      outlineWidth: 1,
      backgroundColor: rowSelectedColor || "rgba(0, 73, 135, 0.1)",
    };

    return css({
      borderLeft: borderLeft?.show
        ? `${borderLeft.width || "1px"} ${borderLeft.style || "solid"} ${
            borderLeft.color || finalBorderColor
          }`
        : "none",
      borderTop: borderTop?.show
        ? `${borderTop.width || "1px"} ${borderTop.style || "solid"} ${
            borderTop.color || finalBorderColor
          }`
        : "none",
      borderRight: borderRight?.show
        ? `${borderRight.width || "1px"} ${borderRight.style || "solid"} ${
            borderRight.color || finalBorderColor
          }`
        : "none",
      borderBottom: borderBottom?.show
        ? `${borderBottom.width || "1px"} ${borderBottom.style || "solid"} ${
            borderBottom.color || finalBorderColor
          }`
        : "none",
      padding: padding || "0.1rem 0.5rem",
      color: fontColor || theme.palette.primary.dark,
      backgroundColor: isSorted
        ? backgroundColorSort
        : backgroundColor || (backgroundColor && isSticky)
        ? backgroundColor
        : fixed && !backgroundColor
        ? "#FFFFFF"
        : "transparent",
      fontWeight: bold ? "bold" : "normal",
      textAlign: textPosition,
      textTransform: textTransform,
      fontSize: fontSize || "1rem",
      fontFamily: theme.typography.body1.fontFamily,
      whiteSpace: ellipsis ? "nowrap" : wrapText ? "normal" : "nowrap",
      maxWidth: maxWidth,
      overflow: ellipsis ? "hidden" : overFlow,
      textOverflow: ellipsis ? "ellipsis" : textOverflow,
      position: isSticky || fixed ? "sticky" : "relative",
      top: isSticky ? "0" : undefined,
      left: fixed ? stickyLeft || "0" : undefined,
      zIndex: fixed && isSticky ? 40 : fixed ? 30 : isSticky ? 10 : undefined,
      boxShadow: undefined,
      opacity: isDragging ? 0.5 : 1,
      "& .sort-icon": {
        opacity: isSortActive ? 1 : 0,
        transition: "opacity 0.2s",
      },
      "&:hover .sort-icon": {
        opacity: 1,
      },
      "&:hover .drag-handle": {
        opacity: 1,
      },
      ...(isSelected ? selectedStyles : {}),
    });
  }
);

export { BaseCellComponent };
