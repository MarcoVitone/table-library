export type TCellValue = string | number | boolean | Record<string, unknown> | null;

export interface ICellEditing<T = Record<string, unknown>, V = TCellValue> {
  /** A row predicate allows individual records to be read-only. Default: true. */
  editable?: boolean | ((row: T) => boolean);
  /** Return an error message to reject a change before onDataChange is called. */
  validate?: (value: V, row: T) => string | null | undefined;
}
