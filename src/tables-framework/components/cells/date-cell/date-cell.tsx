import type { FC } from "react";

import type { IBaseCellProps } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { BaseCell } from "@/tables-framework/components/cells/base-cell/base-cell.tsx";
import { DateTypography } from "./date-cell.style.ts";
import { formatDate } from "@/tables-framework/utils/date-utils/format-date";
import type { DateFormat } from "@/tables-framework/utils/date-utils/format-date";

interface IDateCellProps extends IBaseCellProps {
  format?: DateFormat;
  locale?: string;
  timeZone?: string;
  isNormalDate?: boolean;
}

const DateCell: FC<IDateCellProps> = ({
  data,
  format = "dd/MM/yyyy",
  locale = "en-US",
  timeZone = "Europe/Rome",
  textAlignment,
  ...rest
}) => {
  const dateFormatted = formatDate(data?.value, format, timeZone, locale);

  return (
    <BaseCell data={data} textAlignment={textAlignment} {...rest}>
      <DateTypography>{dateFormatted}</DateTypography>
    </BaseCell>
  );
};

export { DateCell };
export type { IDateCellProps };
