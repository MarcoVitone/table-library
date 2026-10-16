import type { ReactNode } from "react";

export interface IBulkActionContext {
  /** Clears only the rows included in this execution. */
  clearSelection: () => void;
}

export interface IBulkAction<T> {
  id: string;
  label: string;
  icon?: ReactNode;
  onAction: (rows: T[], context: IBulkActionContext) => void | Promise<void>;
  disabled?: boolean | ((rows: T[]) => boolean);
  /** Only applied after successful completion. Defaults to false. */
  clearSelectionOnSuccess?: boolean;
}
