import { nativeElement } from "@/tables-framework/ui/native-element";
export const PaginationContainer = nativeElement<'div', {
  alignment: 'left' | 'center' | 'right';
}>('div', 'tbl-pagination', ({
  alignment
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'center' ? 'center' : 'flex-end',
  padding: '12px 16px',
  gap: 16,
  fontFamily: 'inherit',
  fontSize: 14,
  color: '#333',
  flexWrap: 'wrap'
}));
export const PaginationInfo = nativeElement('span', 'tbl-pagination-info', () => ({
  color: '#666'
}));
export const PaginationControls = nativeElement('div', 'tbl-pagination-controls', () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  maxWidth: '100%',
  justifyContent: 'inherit'
}));
export const PaginationButton = nativeElement<'button', {
  disabled?: boolean;
}>('button', 'tbl-pagination-button', ({
  disabled
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: 4,
  background: disabled ? '#f5f5f5' : '#fff',
  color: disabled ? '#aaa' : '#333',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 14
}));
export const PageSizeSelect = nativeElement('select', 'tbl-select', () => ({
  padding: '6px 8px',
  background: '#fff',
  fontSize: 14,
  cursor: 'pointer'
}));
export const PageNumbers = nativeElement('div', 'tbl-page-numbers', () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexWrap: 'wrap',
  maxWidth: '100%'
}));
export const PageButton = nativeElement<'button', {
  isActive?: boolean;
}>('button', 'tbl-page-button', ({
  isActive
}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 32,
  height: 32,
  padding: '0 8px',
  border: '1px solid ' + (isActive ? '#1976d2' : '#ddd'),
  borderRadius: 4,
  background: isActive ? '#1976d2' : '#fff',
  color: isActive ? '#fff' : '#333',
  cursor: 'pointer',
  fontSize: 14
}));
export const GoToPageContainer = nativeElement('div', 'tbl-goto', () => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8
}));
export const GoToPageInput = nativeElement('input', 'tbl-input', () => ({
  width: 60,
  padding: '6px 8px',
  background: '#fff',
  color: '#333',
  fontSize: 14,
  textAlign: 'center'
}));
export const GoToPageButton = nativeElement('button', 'tbl-button tbl-button-contained', () => ({
  padding: '6px 12px',
  fontSize: 14
}));
