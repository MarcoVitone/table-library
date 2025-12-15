import styled from "@emotion/styled";

export const CurrencyContainer = styled.div<{ position: "left" | "right" }>`
  display: flex;
  align-items: center;
  justify-content: ${({ position }) =>
    position === "right" ? "flex-end" : "flex-start"};
  gap: 4px;
  width: 100%;
`;

export const SymbolWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-size: 0.85em; /* Slightly smaller than value? optional */
`;

export const ValueWrapper = styled.span`
  color: inherit;
`;
