import { css, styled } from "@mui/material/styles";
import { BaseRow } from "../base-row/base-row.jsx";

const ColBaseRow = styled(BaseRow)(() =>
  css({
    boxShadow:
      "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
  })
);

export { ColBaseRow };
