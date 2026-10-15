import { nativeElement } from "@/tables-framework/ui/native-element";
export const InputContainer = nativeElement('div', 'tbl-input-container', () => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));
export const InputComponent = nativeElement<'input', {
  height?: string;
  width?: string;
}>('input', 'tbl-input', ({
  width,
  height
}) => ({
  width: width || '100%',
  minWidth: width ? 'auto' : '70px',
  height: height || '28px',
  padding: '0 .5rem',
  fontFamily: 'inherit',
  lineHeight: 'normal'
}));
