import type { ITableAccessibility, TAccessibilitySlot } from '../../src/tables-framework';
import type { IDynamicTableProps } from '../../src/tables-framework/components/dynamic-table/dynamic-table';

const accessibility: ITableAccessibility = {
  useDefaults: false,
  dialog: { modal: false, trapFocus: false, restoreFocus: false },
  slotProps: {
    table: { 'aria-labelledby': 'users-title', role: undefined },
    rowCheckbox: ({ row, rowId }, defaults) => ({
      'aria-label': `${rowId}: ${String(row?.source.full.name)}`,
      title: defaults.title,
      'data-record': rowId,
    }),
    cellInput: { autoFocus: false, tabIndex: 0, 'aria-describedby': undefined },
  },
  messages: { selectionCount: ({ count }) => `${count} selected`, saving: '' },
  getProps: (slot, defaults, context) => {
    const checkedSlot: TAccessibilitySlot = slot;
    void [checkedSlot, defaults, context.columnId];
    return slot === 'icon' ? { 'aria-hidden': true, focusable: 'false' } : undefined;
  },
};
const props: IDynamicTableProps<{ id: number }> = { data: [], columns: [], accessibility };
// @ts-expect-error Slot names are checked.
const invalid: ITableAccessibility = { slotProps: { unknownControl: {} } };
// @ts-expect-error ARIA values are checked.
const invalidAria: ITableAccessibility = { slotProps: { table: { 'aria-live': 'invalid' } } };
void [props, invalid, invalidAria];
