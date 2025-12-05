import { AccordionSummary } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import type { IStyleFromProps } from "../../../../../theme/common.types";

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: () => true,
};

const CustomAccordionSummary = styled(
  AccordionSummary,
  stylesFromProps
)(() =>
  css({
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    borderRadius: 0,
    width: "100%",
    ".MuiAccordionSummary-content": {
      margin: 0,
      height: "auto",
    },
  })
);

const CustomBar = styled(
  "div",
  stylesFromProps
)(({ theme }) =>
  css({
    width: "0.2rem",
    backgroundColor: theme.palette.secondary.main,
    marginRight: "0.5rem",
  })
);

export { CustomAccordionSummary, CustomBar };
