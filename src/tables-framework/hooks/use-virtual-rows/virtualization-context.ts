import { createContext, useContext, useEffect } from "react";

type RetainRow = (cellId: string, rowId: string | null) => void;
export const VirtualRowRetentionContext = createContext<RetainRow | null>(null);

/** Keep drafts, validation errors and pending saves mounted while scrolling. */
export function useRetainVirtualRow(cellId: string | undefined, rowId: string | undefined, retain: boolean) {
  const retainRow = useContext(VirtualRowRetentionContext);
  useEffect(() => {
    if (!retainRow || !cellId || !rowId || !retain) return;
    retainRow(cellId, rowId);
    return () => retainRow(cellId, null);
  }, [retainRow, cellId, rowId, retain]);
}
