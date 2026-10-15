import { nativeElement } from "@/tables-framework/ui/native-element";
interface RowStyleProps {
  isSelected: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  isSaved?: boolean;
}
export const BaseTr = nativeElement<'tr', RowStyleProps>('tr', 'tbl-row', p => ({
  position: 'relative',
  outlineStyle: 'none',
  outlineColor: p.theme.palette.secondary.dark,
  backgroundColor: p.isSaved ? p.theme.palette.primary.main : p.isSelected || p.isConfigured ? 'rgba(0,73,135,.1)' : undefined,
  cursor: p.isLoading ? 'wait' : undefined
}));
