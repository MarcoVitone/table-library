import { useMemo, useRef, useState } from "react";
import type { IColumnConfig } from "../../../defines/column-config";
import type { IExcelPasteConfig, IPastePreview } from "../../../defines/excel-paste.types";
import { useTable } from "../../../hooks/use-table/use-table";
import { previewExcelPaste } from "../../../utils/excel-paste/excel-paste";
import { serializeTableState } from "../../../utils/table-state/table-state";
import { NativeDialog } from "../../../ui/dialog";
import { Button } from "../../../ui/controls";
import { useTableLocalization } from "../../../localization/use-table-localization";
import { AccessibilityElement } from "../../../accessibility";



export function ExcelPasteToolbar<T extends object>({ data, columns, config, idKey, disabled }: {
  data: T[]; columns: IColumnConfig<T>[]; config: IExcelPasteConfig<T>; idKey: string; disabled?: boolean;
}) {
  const t = useTableLocalization();
  const display = (value: unknown) => value == null ? t("paste.empty") : typeof value === "object" ? JSON.stringify(value) : String(value);
  const { source, rowsStatus } = useTable();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [startRow, setStartRow] = useState(0);
  const [startColumn, setStartColumn] = useState(0);
  const [preview, setPreview] = useState<{ result: IPastePreview<T>; data: T[]; context: string } | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  const rows = source?.body.rows ?? [];
  const visibleColumns = (source?.columns ?? []).flatMap(visible => {
    const column = columns.find(item => item.id === visible.id);
    return column && column.type !== "checkbox" && column.type !== "action" ? [column] : [];
  });
  const dataIndices = useMemo(() => new Map(data.map((row, index) => [row, index])), [data]);
  const indices = rows.map(row => dataIndices.get(row.source.full as unknown as T) ?? -1);
  const context = JSON.stringify([rows.map(row => row.id), visibleColumns.map(column => [column.id, column.dataKey, column.type])]);
  const busy = disabled || Object.values(rowsStatus ?? {}).some(row => row.state === "pending");
  const stale = preview && (preview.data !== data || preview.context !== context);
  const errors = preview?.result.cells.filter(cell => cell.error).length ?? 0;
  const build = () => previewExcelPaste(data, indices, visibleColumns, text, startRow, startColumn, idKey, t);
  const review = () => {
    setError("");
    try { setPreview({ result: build(), data, context }); }
    catch (reason) { setPreview(null); setError(reason instanceof Error ? reason.message : t("paste.invalidBlock")); }
  };
  const apply = async () => {
    if (lock.current || busy || !preview || stale || errors) return;
    setError("");
    try {
      const current = build();
      if (serializeTableState(current.cells) !== serializeTableState(preview.result.cells)) {
        setPreview({ result: current, data, context });
        setError(t("paste.rulesChanged"));
        return;
      }
      if (!current.updatedRows.length) return;
      lock.current = true; setPending(true);
      await config.onApply(current.newData, current.updatedRows);
      setOpen(false); setPreview(null); setText("");
      setMessage(t("paste.applied", { count: current.updatedRows.length }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("paste.saveFailed")); }
    finally { lock.current = false; setPending(false); }
  };
  const changed = () => { setPreview(null); setError(""); };
  return <>
    <Button accessibilitySlot="pasteOpenButton" size="small" disabled={busy || !rows.length || !visibleColumns.length} onClick={() => {
      setOpen(true); setText(""); setPreview(null); setError(""); setMessage(""); setStartRow(0); setStartColumn(0);
    }}>{t("paste.open")}</Button>
    <AccessibilityElement as="div" slot="pasteStatus" role="status">{message}</AccessibilityElement>
    <NativeDialog open={open} onClose={() => { if (!lock.current) setOpen(false); }} title={t("paste.open")} className="tbl-paste-dialog">
      <AccessibilityElement as="div" slot="pasteContent" className="tbl-dialog-content" aria-busy={pending || undefined}>
        <AccessibilityElement as="p" slot="pasteHelp">{t("paste.help")}</AccessibilityElement>
        <AccessibilityElement as="label" slot="pasteRowLabel">{t("paste.startRow")} <AccessibilityElement as="select" slot="pasteRowSelect" value={startRow} disabled={pending} onChange={event => { setStartRow(Number(event.target.value)); changed(); }}>
          {rows.map((row, index) => <option key={row.id} value={index}>{index + 1} — {row.id}</option>)}
        </AccessibilityElement></AccessibilityElement>
        <AccessibilityElement as="label" slot="pasteColumnLabel">{t("paste.startColumn")} <AccessibilityElement as="select" slot="pasteColumnSelect" value={startColumn} disabled={pending} onChange={event => { setStartColumn(Number(event.target.value)); changed(); }}>
          {visibleColumns.map((column, index) => <option key={column.id} value={index}>{column.label}</option>)}
        </AccessibilityElement></AccessibilityElement>
        <AccessibilityElement as="label" slot="pasteTextLabel" style={{ display: "block", marginTop: 12 }}>{t("paste.text")}
          <AccessibilityElement as="textarea" slot="pasteText" rows={5} value={text} disabled={pending} style={{ display: "block", width: "100%", boxSizing: "border-box" }} onChange={event => { setText(event.target.value); changed(); }} />
        </AccessibilityElement>
        <Button accessibilitySlot="pastePreviewButton" disabled={pending || busy || !text} onClick={review}>{t("paste.preview")}</Button>
        {preview && <>
          <AccessibilityElement as="div" slot="pasteStatus" role="status">{t("paste.summary", { count: preview.result.cells.length, errors })}</AccessibilityElement>
          <div style={{ overflow: "auto", maxHeight: 280 }}>
            <AccessibilityElement as="table" slot="pastePreviewTable" className="tbl-paste-preview" aria-label={t("paste.previewLabel")}>
              <AccessibilityElement as="thead" slot="pastePreviewHeader"><AccessibilityElement as="tr" slot="pastePreviewRow" context={{ area: "header" }}>
                {(["paste.row", "paste.column", "paste.before", "paste.after", "paste.error"] as const).map((key, index) =>
                  <AccessibilityElement as="th" slot="pastePreviewCell" key={key} scope="col" context={{ area: "header", index, label: t(key) }}>{t(key)}</AccessibilityElement>)}
              </AccessibilityElement></AccessibilityElement>
              <AccessibilityElement as="tbody" slot="pastePreviewBody">{preview.result.cells.map((cell, index) =>
                <AccessibilityElement as="tr" slot="pastePreviewRow" key={index} context={{ area: "body", index }}>
                  {[cell.row, cell.column, display(cell.previous), display(cell.value), cell.error ?? ""].map((value, columnIndex) =>
                    <AccessibilityElement as="td" slot="pastePreviewCell" key={columnIndex} context={{ area: "body", index: columnIndex, label: String(value) }}>{value}</AccessibilityElement>)}
                </AccessibilityElement>)}</AccessibilityElement>
            </AccessibilityElement>
          </div>
        </>}
        {(error || stale) && <AccessibilityElement as="div" slot="pasteError" role="alert">{stale ? t("paste.stale") : error}</AccessibilityElement>}
        {pending && <AccessibilityElement as="div" slot="pasteStatus" role="status">{t("paste.saving")}</AccessibilityElement>}
      </AccessibilityElement>
      <div className="tbl-dialog-actions">
        <Button accessibilitySlot="pasteCancelButton" disabled={pending} onClick={() => setOpen(false)}>{t("paste.cancel")}</Button>
        <Button accessibilitySlot="pasteApplyButton" variant="contained" disabled={pending || busy || !preview || !!stale || !!errors || !preview.result.updatedRows.length} onClick={apply}>{t("paste.apply")}</Button>
      </div>
    </NativeDialog>
  </>;
}
