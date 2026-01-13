import { Accordion } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import type { IStyleFromProps } from "@/tables-framework/theme/common.types";

interface ICustomAccordionProps {
  isNewRow?: boolean;
  isSalesManager?: boolean;
}

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) => prop !== "isNewRow",
};

const CustomAccordion = styled(
  Accordion,
  stylesFromProps
)<ICustomAccordionProps>(({ isNewRow, isSalesManager, theme }) => {
  let backgroundColor;
  if (isNewRow) {
    backgroundColor = theme.palette.primary.main;
  } else {
    backgroundColor = isSalesManager ? "#FDF0E5" : "white";
  }
  return css({
    width: "inherit",
    borderRadius: "0px !important",
    backgroundColor,
  });
});

export { CustomAccordion };
