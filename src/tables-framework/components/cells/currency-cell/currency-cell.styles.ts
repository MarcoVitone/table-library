import { nativeElement } from "@/tables-framework/ui/native-element";
export const CurrencyContainer = /* @__PURE__ */ nativeElement<'div', {
  position: 'left' | 'right';
}>('div', 'tbl-currency', ({
  position
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
  gap: 4,
  width: '100%'
}));
export const SymbolWrapper = /* @__PURE__ */ nativeElement('span', 'tbl-currency-symbol', () => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: 'inherit',
  fontSize: '.85em'
}));
export const ValueWrapper = /* @__PURE__ */ nativeElement('span', 'tbl-currency-value');
