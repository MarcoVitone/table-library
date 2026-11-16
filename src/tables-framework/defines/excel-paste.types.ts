export interface IExcelPasteConfig<T> {
  /** Commit the complete block once. The owner updates data after a successful save. */
  onApply: (newData: T[], updatedRows: T[]) => void | Promise<void>;
}

export interface IPasteCell {
  row: number;
  column: string;
  previous: unknown;
  value: unknown;
  error?: string;
}

export interface IPastePreview<T> {
  cells: IPasteCell[];
  newData: T[];
  updatedRows: T[];
}
