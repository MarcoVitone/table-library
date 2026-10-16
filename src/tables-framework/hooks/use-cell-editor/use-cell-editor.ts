import { useEffect, useRef, useState } from "react";
import type { ICell } from "../../defines/common.types";
import type { ICellEditing, TCellValue } from "../../defines/editing.types";
import { useTable } from "../use-table/use-table";
import { useRetainVirtualRow } from "../use-virtual-rows/virtualization-context";

interface Options<V> extends ICellEditing<Record<string, unknown>, V> {
  data?: ICell;
  sourceValue: V;
  onCellChange?: (value: V, data: ICell) => void | Promise<void>;
}

export function useCellEditor<V extends TCellValue>({ data, sourceValue, onCellChange, editable = true, validate }: Options<V>) {
  const { rowStatus, setRowsStatus } = useTable(data);
  const [value, setValue] = useState(sourceValue);
  const [previousSource, setPreviousSource] = useState(sourceValue);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useRetainVirtualRow(data?.id, data?.row?.id, isSaving || !!error || !Object.is(value, sourceValue));
  const pending = useRef(false);
  const mounted = useRef(true);
  const latestSource = useRef(sourceValue);
  useEffect(() => { latestSource.current = sourceValue; }, [sourceValue]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  if (!Object.is(sourceValue, previousSource)) {
    setPreviousSource(sourceValue);
    setValue(sourceValue);
    setError(null);
  }
  const row = data?.row?.source?.full as Record<string, unknown>;
  const rowBusy = rowStatus?.state === "pending" && rowStatus.savingCellId !== data?.id;
  const canEdit = !rowBusy && (typeof editable === "function" ? editable(row) : editable);
  const change = (next: V) => {
    if (!canEdit || pending.current) return;
    setValue(next);
    setError(null);
  };
  const cancel = () => {
    if (pending.current) return;
    setValue(sourceValue);
    setError(null);
  };
  const commit = (next: V = value) => {
    if (!canEdit || pending.current || !data || !onCellChange || Object.is(next, sourceValue)) return;
    try {
      const message = validate?.(next, row);
      if (message) { if (error !== message) setError(message); return; }
      if (error !== null) setError(null);
      const result = onCellChange(next, data);
      if (result && typeof result.then === "function") {
        pending.current = true;
        setIsSaving(true);
        const rowId = data.row?.id;
        if (setRowsStatus && rowId) setRowsStatus(previous => previous[rowId]
          ? { ...previous, [rowId]: { ...previous[rowId], state: "pending", savingCellId: data.id } }
          : previous);
        Promise.resolve(result).catch(reason => {
          if (mounted.current && Object.is(latestSource.current, sourceValue)) {
            setError(reason instanceof Error ? reason.message : "Salvataggio non riuscito");
          }
        }).finally(() => {
          pending.current = false;
          if (mounted.current) setIsSaving(false);
          if (setRowsStatus && rowId) setRowsStatus(previous => previous[rowId]?.savingCellId === data.id
            ? { ...previous, [rowId]: { ...previous[rowId], state: "ready", savingCellId: undefined } }
            : previous);
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Salvataggio non riuscito");
    }
  };
  return { value, change, cancel, commit, error, setError, isSaving, canEdit };
}
