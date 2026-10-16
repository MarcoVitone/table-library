import type { IColumnConfig, IDynamicTableProps } from "../../src/tables-framework/components/dynamic-table/dynamic-table";
interface Row { id: number; name: string; locked: boolean }
const valid: IColumnConfig<Row>[] = [
  { id: "name", label: "Name", bodyProps: { backgroundColor: "red" } },
  { id: "input", label: "Input", type: "input", editable: row => !row.locked,
    validate: (value, row) => String(value) === row.name ? "Unchanged" : undefined,
    bodyProps: { inputType: "number", inputWidth: "50px", editable: row => !row.locked } },
  { id: "action", label: "Actions", type: "action", bodyProps: { actions: [{
    onAction: row => { row.name.toUpperCase(); }, component: "button", label: "Open",
  }] } },
  { id: "status", label: "Status", type: "status", bodyProps: { labelKey: "name", getLabel: value => String(value) } },
  { id: "date", label: "Date", type: "date", bodyProps: { format: "yyyy-MM-dd" } },
  { id: "nativeDate", label: "Date", type: "date", bodyProps: {
    locale: "it-IT", timeZone: "Europe/Rome", format: { dateStyle: "long", timeStyle: "short" },
  } },
  { id: "currency", label: "Amount", type: "currency", decimals: 2, bodyProps: { currencySymbol: "$" } },
  { id: "auto", label: "Role", type: "autocomplete", autocompleteOptions: ["Admin"],
    validate: (value, row) => value === row.name ? undefined : "Select a role" },
  { id: "check", label: "Select", type: "checkbox", bodyProps: { disabled: true } },
  { id: "custom", label: "Custom", type: "custom", component: "span", bodyProps: { customSetting: true } },
];
// @ts-expect-error Currency settings do not belong to a text column.
const invalidCurrency: IColumnConfig<Row> = { id: "x", label: "X", type: "text", decimals: 2 };
// @ts-expect-error Actions are only allowed on action columns.
const invalidActions: IColumnConfig<Row> = { id: "x", label: "X", type: "input", bodyProps: { actions: [] } };
// @ts-expect-error A custom column needs a component.
const missingCustom: IColumnConfig<Row> = { id: "x", label: "X", type: "custom" };
// @ts-expect-error Input types are checked.
const invalidInput: IColumnConfig<Row> = { id: "x", label: "X", type: "input", inputType: "unsupported" };
// @ts-expect-error Input validation must return a message or no error.
const invalidValidator: IColumnConfig<Row> = { id: "x", label: "X", type: "input", validate: () => true };
const props: IDynamicTableProps<Row> = {
  data: [], columns: valid, dataMode: "server", totalItems: 0,
  query: { page: 0, pageSize: 25, sorting: [], filters: [] }, onQueryChange: next => { void next.filters.length; },
  onDataChange: async (_next, row) => { row.name.toUpperCase(); },
  virtualization: { height: "50vh", rowHeight: 48, overscan: 5 },
  globalSearch: { columns: ["name"], value: "test", onChange: value => { value.toUpperCase(); } },
  savedViews: { key: "users", storage: "sessionStorage", onViewsChange: views => { void views[0]?.state.columnsLayout; } },
  bulkActions: [{ id: "edit", label: "Edit", disabled: rows => rows.some(row => row.locked),
    onAction: async (rows, { clearSelection }) => { rows[0]?.name.toUpperCase(); clearSelection(); }, clearSelectionOnSuccess: true }],
};
// @ts-expect-error Virtualization uses a numeric estimate in pixels.
const invalidVirtualization: IDynamicTableProps<Row> = { data: [], columns: valid, virtualization: { rowHeight: "48px" } };
void invalidVirtualization;
// @ts-expect-error Search columns must be data key strings.
const invalidSearch: IDynamicTableProps<Row> = { data: [], columns: valid, globalSearch: { columns: [3] } };
void invalidSearch;
// @ts-expect-error Bulk action records keep the table's row type.
const invalidBulk: IDynamicTableProps<Row> = { data: [], columns: valid, bulkActions: [{ id: "x", label: "X", onAction: (rows: number[]) => { void rows; } }] };
// @ts-expect-error Saved views need a unique storage key.
const invalidViews: IDynamicTableProps<Row> = { data: [], columns: valid, savedViews: {} };
void [invalidBulk, invalidViews];
void [valid, invalidCurrency, invalidActions, missingCustom, invalidInput, invalidValidator, props];
