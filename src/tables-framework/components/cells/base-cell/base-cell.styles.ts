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
  isSticky?: boolean;
  isFirstRow?: boolean;
  fixed?: boolean;
  isSelected?: boolean;
  rowSelectedColor?: string;
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
    prop !== "rowSelectedColor",
};

const BaseCellComponent = styled(
  "td",
  stylesFromProps
)<IBaseCellProps>(
  ({
    noRight,
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
    isSticky,
    fixed,
    isSelected,
    rowSelectedColor,
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
    console.log({ isSelected });
    // const shadows: string[] = [];

    // if (!noTop && area !== "header") {
    //   shadows.push(`inset 0 0.5px 0 0 ${finalBorderColor}`); // top: offset-y positivo
    // } else if (!noTop && area === "header") {
    //   shadows.push(`inset 0 1px 0 0 ${finalBorderColor}`); // top: offset-y positivo
    // }
    // if (!noRight && area !== "header") {
    //   shadows.push(`inset 0.5px 0 0 0 ${finalBorderColor}`); // right: offset-x negativo
    // } else if (!noRight && area === "header") {
    //   shadows.push(`inset 1px 0 0 0 ${finalBorderColor}`); // right: offset-x negativo
    // }
    // if (!noBorder && area !== "header") {
    //   shadows.push(`inset 0 -0.5px 0 0 ${finalBorderColor}`); // bottom: offset-y negativo
    // } else if (!noBorder && area === "header") {
    //   shadows.push(`inset 0 -1px 0 0 ${finalBorderColor}`); // bottom: offset-y negativo
    // }
    // if (!noLeft && area !== "header") {
    //   shadows.push(`inset -0.5px 0 0 0 ${finalBorderColor}`); // left: offset-x positivo
    // } else if (!noLeft && area === "header") {
    //   shadows.push(`inset -1px 0 0 0 ${finalBorderColor}`); // left: offset-x positivo
    // }
    return css({
      ...(noBorder
        ? { border: "none" }
        : {
            borderLeft: "none",
            borderRight: noRight ? "none" : `1px solid ${finalBorderColor}`,
            borderTop: "none",
            borderBottom: `1px solid ${finalBorderColor}`,
          }),
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
      position: isSticky || fixed ? "sticky" : "relative",
      top: isSticky ? "0" : undefined,
      left: fixed ? "0" : undefined,
      zIndex: fixed && isSticky ? 40 : fixed ? 30 : isSticky ? 10 : undefined,
      boxShadow: undefined,
      // boxShadow: shadows.length ? shadows.join(", ") : "none",
      ...(overFlow ? { overflow: overFlow } : {}),
      ...(textOverflow ? { textOverflow } : {}),
      "& .sort-icon": {
        opacity: isSortActive ? 1 : 0,
        transition: "opacity 0.2s",
      },
      "&:hover .sort-icon": {
        opacity: 1,
      },
      ...(isSelected ? selectedStyles : {}),
    });
  }
);

export { BaseCellComponent };
