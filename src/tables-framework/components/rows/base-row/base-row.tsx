import type { FC } from "react";
import type { IRowProps } from "@/tables-framework/defines/common.types.ts";
import { BaseTr } from "./base-row.styles.ts";
import { useTable } from "@/tables-framework/hooks/use-table/use-table.ts";

interface IBaseRowProps extends IRowProps {
  isStepFour?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BaseRow: FC<IBaseRowProps> = ({ data, isStepFour = false, children, ...rest }) => {
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
    <BaseTr {...rest}
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
