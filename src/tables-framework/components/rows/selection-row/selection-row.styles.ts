import { nativeElement } from "@/tables-framework/ui/native-element";
export const BaseTr = nativeElement<'tr', {
  isSelected: boolean;
  isLoading: boolean;
}>('tr', 'tbl-row tbl-selection-row', p => ({
  position: 'relative',
  cursor: p.isLoading ? 'wait' : 'pointer',
  outlineStyle: 'none',
  outlineColor: p.theme.palette.secondary.dark,
  backgroundColor: p.isSelected ? p.theme.palette.primary.light : undefined
}));
