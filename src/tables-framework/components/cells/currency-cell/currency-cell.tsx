import type { FC, ReactNode } from "react";
import type { IBaseCellProps } from "../base-cell/base-cell.tsx";
import { BaseCell } from "../base-cell/base-cell.tsx";
import {
  CurrencyContainer,
  SymbolWrapper,
  ValueWrapper,
} from "./currency-cell.styles.ts";

export type TCurrencySymbolPosition = "left" | "right";

interface ICurrencyCellProps extends IBaseCellProps {
  currencySymbol?: string | ReactNode;
  symbolPosition?: TCurrencySymbolPosition;
  decimals?: number;
}

const CurrencyCell: FC<ICurrencyCellProps> = ({
  data,
  currencySymbol = "€",
  symbolPosition = "left",
  decimals = 2,
  ...rest
}) => {
  const formatValue = (val: unknown): string => {
    const num = Number(val);
    if (isNaN(num)) return String(val ?? "");
    return new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formattedValue = formatValue(data?.value);

  return (
    <BaseCell data={data} {...rest}>
      <CurrencyContainer position={symbolPosition}>
        {symbolPosition === "left" && (
          <SymbolWrapper>{currencySymbol}</SymbolWrapper>
        )}
        <ValueWrapper>{formattedValue}</ValueWrapper>
        {symbolPosition === "right" && (
          <SymbolWrapper>{currencySymbol}</SymbolWrapper>
        )}
      </CurrencyContainer>
    </BaseCell>
  );
};

export type { ICurrencyCellProps };
export { CurrencyCell };
