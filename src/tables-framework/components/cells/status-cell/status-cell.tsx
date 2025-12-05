import type { FC } from "react";

import type { IBaseCellProps } from "../base-cell/base-cell.jsx";
import { BaseCell } from "../base-cell/base-cell.jsx";
import {
  TableStatusChip,
  type TChipStatus,
} from "../../table-sub-components/chip/chip.js";

const StatusCell: FC<IBaseCellProps> = ({ data, ...rest }) => {
  return (
    <BaseCell data={data} {...rest}>
      <TableStatusChip status={data.value as TChipStatus} />
    </BaseCell>
  );
};

export { StatusCell };
