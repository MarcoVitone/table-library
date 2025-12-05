import {
  Button as MUIButton,
  IconButton as MUIIconButton,
} from "@mui/material";
import { css, styled } from "@mui/material/styles";
import type { TExtendedButtonProps } from "./button.ts";
import type { IStyleFromProps } from "../../../theme/common.types.ts";

type TButtonStyleProps = Pick<TExtendedButtonProps, "status" | "variation">;

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) => prop !== "status" && prop !== "variation",
};

const Button = styled(
  MUIButton,
  stylesFromProps
)<TButtonStyleProps>(({ variation, theme }) =>
  css({
    textTransform: theme.typography.button.textTransform,
    fontSize: theme.typography.button.fontSize,
    borderRadius:
      variation === "chip-style" || variation === "chip-filters-style"
        ? "1rem"
        : "",
    backgroundColor:
      variation === "chip-style" ? theme.palette.primary.light : "",
    color: variation === "chip-style" ? theme.palette.primary.main : "",
    padding:
      variation === "chip-style" || variation === "chip-filters-style"
        ? "0 1rem 0 0.75rem"
        : "0.5rem 1rem 0.5rem 1rem",
    height:
      variation === "chip-style" || variation === "chip-filters-style"
        ? "2rem"
        : "2.5rem",
    border:
      variation === "chip-style" || variation === "chip-filters-style"
        ? `0.063rem id ${theme.palette.primary.dark}`
        : "",
    ":hover": {
      backgroundColor:
        variation === "chip-style" ? theme.palette.primary.light : "",
      border:
        variation === "chip-style" || variation === "chip-filters-style"
          ? `0.063rem id ${theme.palette.primary.dark}`
          : "",
    },
    ":active": {
      color: variation === "chip-style" ? theme.palette.primary.main : "",
      backgroundColor:
        variation === "chip-style" ? theme.palette.secondary.main : "",
      border: variation === "chip-style" ? "none" : "",
    },
    // '& .Mui-disabled .MuiSvgIcon-root .deleteIcon': {
    //     fill: theme.palette.Grey.main
    // }
  })
);

const IconButton = styled(
  MUIIconButton,
  stylesFromProps
)<TButtonStyleProps>(({ status, theme }) =>
  css({
    backgroundColor: "none",
    color: status === "disabled" ? "" : theme.palette.primary.dark,
    ":hover": {
      backgroundColor:
        status === "disabled" ? "none" : theme.palette.primary.light,
      border: "none",
    },
    ":disabled": {
      color: theme.palette.primary.light,
      backgroundColor: "none",
      border: "none",
    },
    ":active": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
    "&.Mui-disabled .MuiSvgIcon-root .deleteIcon": {
      fill: theme.palette.primary.light,
    },
  })
);
export { Button, IconButton };
