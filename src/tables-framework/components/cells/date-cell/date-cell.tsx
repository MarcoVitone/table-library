import { format as formatFn } from "date-fns";
import type { FC } from "react";

import { toZonedTime } from "date-fns-tz";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import { DateTypography } from "./date-cell.style.ts";
import { useTimezone } from "../../../hooks/use-timezone/use-timezone.tsx";

interface IDateCellProps extends IBaseCellProps {
  format?: string;
  isNormalDate?: boolean;
}

const DateCell: FC<IDateCellProps> = ({
  data,
  format = "P",
  textAlignment,
  ...rest
}) => {
  const { timezone } = useTimezone();
  const dateByTimezone = toZonedTime(data.value as string, timezone);
  const dateFormatted = formatFn(dateByTimezone, format);

  return (
    <BaseCell data={data} textAlignment={textAlignment} {...rest}>
      <DateTypography>{dateFormatted}</DateTypography>
    </BaseCell>
  );
};

export { DateCell };
