import { css, styled } from "@mui/material/styles";
import type { IStyleFromProps } from "../../../theme/common.types";

interface ITableRowProps {
  height?: string;
}

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) => prop !== "height",
};

const TableRow = styled(
  "tr",
  stylesFromProps
)<ITableRowProps>(({ height }) => {
  return css({
    position: "relative",
    height: height || 100,
  });
});

const TableData = styled(
  "td",
  stylesFromProps
)(() => {
  return css({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000,
    display: "inline-block",
  });
});

export { TableData, TableRow };
