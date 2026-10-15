import { format as formatFn } from "date-fns";
import type { FC } from "react";

import { toZonedTime } from "date-fns-tz";
import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { DateTypography } from "./date-cell.style.ts";
import { useTimezone } from "@/tables-framework/hooks/use-timezone/use-timezone.tsx";

interface IDateCellProps extends IBaseCellProps {
  format?: string;
  isNormalDate?: boolean;
}

const DateCell: FC<IDateCellProps> = ({
  data,
  format = "dd/MM/yyyy",
  textAlignment,
  ...rest
}) => {
  const { timezone } = useTimezone();
  const value = data?.value;
  const dateByTimezone = (typeof value === "string" && value.trim() !== "")
    || typeof value === "number" || value instanceof Date
    ? toZonedTime(value as string | number | Date, timezone)
    : null;
  const dateFormatted = dateByTimezone && !Number.isNaN(dateByTimezone.getTime())
    ? formatFn(dateByTimezone, format)
    : "";

  return (
    <BaseCell data={data} textAlignment={textAlignment} {...rest}>
      <DateTypography>{dateFormatted}</DateTypography>
    </BaseCell>
  );
};

export { DateCell };
export type { IDateCellProps };
