import type { FC } from "react";
import { Circle } from "@mui/icons-material";
import type { ChipProps as MUIChipProps } from "@mui/material";
import { Chip } from "./chip.styles.ts";

type TChipStatus =
  | "validated"
  | "pending"
  | "partiallyConfirmed"
  | "confirmed"
  | "toBeApproved"
  | "inProcess"
  | "inDelivery"
  | "submitted"
  | "delivered"
  | "requested"
  | "cancelled"
  | "active"
  | "inactive"
  | "closed";

interface IChipProps {
  status: TChipStatus;
}

type TLabelMap = {
  [key in TChipStatus]: string;
};

const TableStatusChip: FC<IChipProps & MUIChipProps> = ({
  status,
  ...props
}) => {
  const labelObject: TLabelMap = {
    validated: "Validated",
    cancelled: "Cancelled",
    confirmed: "Confirmed",
    pending: "Pending",
    partiallyConfirmed: "Partially confirmed",
    toBeApproved: "To be approved",
    inProcess: "In process",
    inDelivery: "In delivery",
    submitted: "Submitted",
    delivered: "Delivered",
    requested: "Requested",
    closed: "Closed",
    active: "Active",
    inactive: "Inactive",
  };

  return (
    <Chip
      label={labelObject[status]}
      status={status}
      icon={<Circle />}
      {...props}
    />
  );
};

export type { IChipProps, TChipStatus };
export { TableStatusChip };
