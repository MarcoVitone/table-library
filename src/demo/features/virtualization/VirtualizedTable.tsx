import { useMemo, useState } from "react";
import { DynamicTable, type IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";

interface VirtualRow { id: number; name: string; description: string; quantity: number }
const initialRows: VirtualRow[] = Array.from({ length: 10000 }, (_, id) => ({
  id, name: `Riga ${String(id).padStart(5, "0")}`, quantity: id,
  description: id % 17 === 0
    ? "Un testo più lungo su più righe per mostrare la misura automatica dell’altezza. ".repeat(3)
    : `Descrizione ${id}`,
}));

export function VirtualizedTable() {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState(0);
  const [bulkCount, setBulkCount] = useState(0);
  const [compact, setCompact] = useState(false);
  const [asyncSave, setAsyncSave] = useState(false);
  const [rejectSave, setRejectSave] = useState(false);
  const [lastEdit, setLastEdit] = useState<VirtualRow | null>(null);
  const columns = useMemo<IColumnConfig<VirtualRow>[]>(() => [
    { id: "selection", label: "Seleziona", type: "checkbox", width: 48, fixed: true },
    { id: "name", label: "Nome", dataKey: "name", width: 220, minWidth: 160, fixed: true,
      headerProps: { sortable: true, backgroundColor: "#eef4ff" }, filterConfig: { type: "text" } },
    { id: "description", label: "Descrizione", dataKey: "description", width: 360,
      headerProps: { backgroundColor: "#eef4ff" }, bodyProps: { wrapText: true } },
    { id: "quantity", label: "Quantità", dataKey: "quantity", type: "input", inputType: "number", width: 140,
      headerProps: { backgroundColor: "#eef4ff" },
      validate: value => typeof value === "number" && value >= 0 ? undefined : "Inserisci una quantità positiva o zero" },
  ], []);

  return <>
    <p>10.000 righe senza paginazione, con selezione, colonne fisse e altezza variabile.</p>
    <label><input type="checkbox" checked={compact} onChange={event => setCompact(event.target.checked)} />Viewport compatto</label>
    <label><input type="checkbox" checked={asyncSave} onChange={event => setAsyncSave(event.target.checked)} />Salvataggio differito</label>
    <label><input type="checkbox" checked={rejectSave} onChange={event => setRejectSave(event.target.checked)} />Rifiuta salvataggio</label>
    <button type="button" onClick={() => setRows(previous => previous.slice(0, 25))}>Riduci a 25 righe</button>
    <button type="button" onClick={() => setRows(initialRows)}>Ripristina dataset</button>
    <DynamicTable data={rows} columns={columns} tableLabel="Righe virtualizzate"
      maxHeight={compact ? 240 : 400} virtualization={{ rowHeight: 48, overscan: 4 }}
      globalSearch enableColumnFilters isResizable stripedRows onRowSelectionChange={selectedRows => setSelected(selectedRows.length)}
      bulkActions={[{ id: "count", label: "Conta selezionate", onAction: selectedRows => setBulkCount(selectedRows.length) }]}
      onDataChange={(_next, updated) => {
        const apply = () => {
          if (rejectSave) throw new Error("Salvataggio rifiutato");
          setRows(previous => previous.map(row => row.id === updated.id ? updated : row));
          setLastEdit(updated);
        };
        if (asyncSave) return new Promise<void>((resolve, reject) => setTimeout(() => {
          try { apply(); resolve(); } catch (error) { reject(error); }
        }, 600));
        apply();
      }} />
    <output aria-label="Righe selezionate virtuali">{selected}</output>
    <output aria-label="Righe elaborate virtuali">{bulkCount}</output>
    <output aria-label="Ultima modifica virtuale">{lastEdit ? JSON.stringify(lastEdit) : "Nessuna modifica"}</output>
  </>;
}
