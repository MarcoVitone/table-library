import { useTableLocalization } from "@/tables-framework/localization/use-table-localization";
import { AccessibilityElement, useTableAccessibility } from "@/tables-framework/accessibility";
import { useRef, useState } from "react";
import type { IBulkAction } from "../../../defines/bulk-actions.types";
import { useTable } from "../../../hooks/use-table/use-table";
import { Button } from "../../../ui/controls";

interface IProps<T> { actions: IBulkAction<T>[]; disabled?: boolean }

export function BulkActionsToolbar<T>({ actions, disabled = false }: IProps<T>) {
  const t = useTableLocalization();
  const { message } = useTableAccessibility();
  const { selectedRows, setRowsStatus, clearSelectedRows } = useTable();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const executing = useRef(false);
  const selected = selectedRows ?? [];
  const rows = selected.map(row => row.source.full as T);
  const isDisabled = (action: IBulkAction<T>) => disabled || !!pending || !rows.length
    || (typeof action.disabled === "function" ? action.disabled(rows) : !!action.disabled);

  const execute = async (action: IBulkAction<T>) => {
    if (executing.current || isDisabled(action)) return;
    executing.current = true;
    const ids = new Set(selected.map(row => row.id));
    const clearSelection = () => setRowsStatus?.(previous => Object.fromEntries(Object.entries(previous)
      .map(([id, status]) => [id, ids.has(id) ? { ...status, isSelected: false } : status])));
    setPending(action.id); setError("");
    try {
      await action.onAction([...rows], { clearSelection });
      if (action.clearSelectionOnSuccess) clearSelection();
    } catch (failure) {
      setError(failure instanceof Error && failure.message ? failure.message : t("bulk.failed"));
    } finally {
      executing.current = false; setPending(null);
    }
  };

  if (!actions.length || (!rows.length && !pending && !error)) return null;
  return <AccessibilityElement as="section" slot="bulkActions" className="tbl-bulk-actions" aria-label={t("a11y.bulk")} aria-busy={!!pending}>
    <AccessibilityElement as="div" slot="bulkToolbar" className="tbl-feature-toolbar" role="toolbar" aria-label={t("a11y.bulkToolbar")}>
      <AccessibilityElement as="span" slot="bulkSelectionStatus" context={{ count: rows.length }} role="status">{message("selectionCount", t("a11y.selected", { count: rows.length }), { count: rows.length })}</AccessibilityElement>
      {actions.map(action => <Button accessibilitySlot="bulkAction" accessibilityContext={{ actionId: action.id }} key={action.id} size="small" startIcon={action.icon}
        disabled={isDisabled(action)} onClick={() => { void execute(action); }}>{action.label}</Button>)}
      <Button accessibilitySlot="bulkClearButton" size="small" disabled={!!pending || !rows.length} onClick={() => { clearSelectedRows(); setError(""); }}>{t("bulk.clear")}</Button>
    </AccessibilityElement>
    {pending && <AccessibilityElement as="div" slot="bulkPending" role="status">{message("bulkPending", t("a11y.pending"))}</AccessibilityElement>}
    {error && <AccessibilityElement as="div" slot="bulkError" role="alert">{error} <Button accessibilitySlot="bulkErrorCloseButton" size="small" onClick={() => setError("")}>{t("bulk.closeError")}</Button></AccessibilityElement>}
  </AccessibilityElement>;
}
