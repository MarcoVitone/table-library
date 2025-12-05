import type { FC } from "react";
import type { IRowProps } from "../../../defines/common.types.ts";
import { BaseTr } from "./base-row.styles.ts";
import { useTable } from "../../../hooks/use-table/use-table.ts";

interface IBaseRowProps extends IRowProps {
  isStepFour?: boolean;
}

const BaseRow: FC<IBaseRowProps> = ({ data, isStepFour = false, children }) => {
  const { rowStatus } = useTable(data);

  const isSelected = !!rowStatus && rowStatus.isSelected;

  const isLoading = !!rowStatus && rowStatus.state === "pending";

  const isConfigured =
    data.source.full.orderLineCode !== "" &&
    data.source.full.orderLineCode !== undefined &&
    data.source.full.orderLineCode !== "-" &&
    isStepFour;

  const isSaved = (data.source.full.isSaved as boolean) ?? undefined;

  return (
    <BaseTr
      isSelected={isSelected}
      isLoading={isLoading}
      isConfigured={isConfigured}
      isSaved={isSaved}
    >
      {children}
    </BaseTr>
  );
};

export { BaseRow };
