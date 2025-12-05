import { css } from "@emotion/react";
import styled from "@emotion/styled";
import type { IStyleFromProps } from "../../../theme/common.types";
import type { IChipProps, TChipStatus } from "./chip";
import { Chip as MuiChip } from "@mui/material";

type TChipStyleProps = Pick<IChipProps, "status">;

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) => prop !== "status",
};

const backgroundColorMap: Record<TChipStatus, string> = {
  validated: "rgba(255, 237, 72, 0.5)",
  pending: "rgba(225, 163, 66, 0.5)",
  partiallyConfirmed: "rgba(0, 73, 135, 0.1)",
  confirmed: "rgba(0, 73, 135, 0.7)",
  toBeApproved: "rgba(162, 170, 207, 0.5)",
  inProcess: "rgba(52, 119, 139, 0.7)",
  inDelivery: "rgba(172, 198, 109, 0.5)",
  cancelled: "rgba(204, 0, 12, 0.5)",
  submitted: "rgba(204, 0, 12, 0.5)",
  delivered: "rgba(204, 0, 12, 0.5)",
  requested: "rgba(204, 0, 12, 0.5)",
  closed: "rgba(133, 179, 116, 1)",
  active: "rgba(0, 73, 135, 0.7)",
  inactive: "rgba(204, 0, 12, 0.5)",
};

const colorMap: Record<TChipStatus, string> = {
  validated: "rgba(0, 38, 71, 1)",
  pending: "rgba(0, 38, 71, 1)",
  partiallyConfirmed: "rgba(0, 38, 71, 1)",
  confirmed: "rgba(255, 255, 255, 1)",
  toBeApproved: "rgba(0, 38, 71, 1)",
  inProcess: "rgba(255, 255, 255, 1)",
  inDelivery: "rgba(0, 38, 71, 1)",
  cancelled: "rgba(255, 255, 255, 1)",
  submitted: "rgba(255, 255, 255, 1)",
  delivered: "rgba(255, 255, 255, 1)",
  requested: "rgba(255, 255, 255, 1)",
  closed: "rgba(0, 38, 71, 1)",
  active: "rgba(0, 38, 71, 1)",
  inactive: "rgba(255, 255, 255, 1)",
};

const iconColorMap: Record<TChipStatus, string> = {
  validated: "rgba(208, 191, 33, 1)",
  pending: "rgba(180, 123, 35, 1)",
  partiallyConfirmed: "rgba(125, 149, 170, 1)",
  confirmed: "rgba(0, 44, 82, 1)",
  toBeApproved: "rgba(127, 134, 167, 1)",
  inProcess: "rgba(36, 88, 104, 1)",
  inDelivery: "rgba(117, 146, 48, 1)",
  cancelled: "rgba(204, 0, 12, 1)",
  submitted: "rgba(204, 0, 12, 1)",
  delivered: "rgba(204, 0, 12, 1)",
  requested: "rgba(204, 0, 12, 1)",
  closed: "rgba(88, 129, 73, 1)",
  active: "rgba(88, 129, 73, 1)",
  inactive: "rgba(204, 0, 12, 1)",
};

const Chip = styled(
  MuiChip,
  stylesFromProps
)<TChipStyleProps>(({ status }) =>
  css({
    backgroundColor: backgroundColorMap[status],
    color: colorMap[status],
    letterSpacing: "0.4px",
    paddingRight: "var(--borderRadius, 0px)",
    height: "1.25rem",

    ".MuiChip-icon": {
      color: iconColorMap[status],
      height: "0.8rem",
      width: "0.8rem",
    },
  })
);

export { Chip };
