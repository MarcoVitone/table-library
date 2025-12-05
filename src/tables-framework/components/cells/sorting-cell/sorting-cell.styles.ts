import { css, styled } from "@mui/material/styles";
import { BaseCell } from "../base-cell/base-cell.jsx";
import type { IStyleFromProps } from "../../../theme/common.types.js";
import type { TAlignment, TDirection } from "../../../defines/common.types.ts";

interface ISortingBaseCell {
  direction: TDirection;
  disabled: boolean;
  textAlignment?: TAlignment;
  padding?: string;
}

const sortingStylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) =>
    prop !== "direction" &&
    prop !== "disabled" &&
    prop !== "textAlignment" &&
    prop !== "padding",
};

const SortingBaseCell = styled(
  BaseCell,
  sortingStylesFromProps
)<ISortingBaseCell>(({ direction, disabled, textAlignment, padding }) => {
  let contentPosition = "center";
  if (textAlignment === "left") {
    contentPosition = "flex-start";
  } else if (textAlignment === "right") {
    contentPosition = "flex-end";
  }

  return css({
    padding: padding ? padding : "0.5rem",
    "& > span": {
      display: "flex",
      gap: "4px",
      justifyContent: contentPosition,
      flexDirection: direction,
      alignItems: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      whiteSpace: "pre-line",
    },
  });
});

export { SortingBaseCell };
