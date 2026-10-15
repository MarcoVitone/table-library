import { nativeElement } from "@/tables-framework/ui/native-element";
export const TableRow = nativeElement<'tr', {
  height?: string;
}>('tr', 'tbl-empty-row', ({
  height
}) => ({
  position: 'relative',
  height: height || 100
}));
export const TableData = nativeElement('td', 'tbl-empty-cell', () => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%,-50%)',
  zIndex: 1000,
  display: 'inline-block'
}));
