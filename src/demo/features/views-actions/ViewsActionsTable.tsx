import { useState } from "react";
import { DynamicTable, type IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { ITableQuery } from "@/tables-framework/defines/query.types";
import type { IBulkAction } from "@/tables-framework/defines/bulk-actions.types";

interface Contact { id: number; name: string; city: string; status: string }
const initialData: Contact[] = [
  { id: 0, name: "Marco", city: "Roma", status: "Attivo" },
  { id: 1, name: "Anna", city: "Milano", status: "Attivo" },
  { id: 2, name: "Giulia", city: "Roma", status: "Attivo" },
  { id: 3, name: "Bruno", city: "Torino", status: "Archiviato" },
  { id: 4, name: "Carla", city: "Roma", status: "Attivo" },
  { id: 5, name: "Dario", city: "Milano", status: "Attivo" },
];
const columns: IColumnConfig<Contact>[] = [
  { id: "selection", label: "Seleziona", type: "checkbox", width: 48, fixed: true },
  { id: "name", label: "Nome", width: 220, minWidth: 100, headerProps: { sortable: true }, filterConfig: { type: "text" } },
  { id: "city", label: "Città", width: 200, filterConfig: { type: "text" } },
  { id: "status", label: "Stato", width: 180 },
];

export function ViewsActionsTable() {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState<ITableQuery>({ page: 0, pageSize: 2, sorting: [], filters: [] });
  const [unified, setUnified] = useState(true);
  const [reject, setReject] = useState(false);
  const [defer, setDefer] = useState(true);
  const [lastRows, setLastRows] = useState<number[]>([]);
  const [executions, setExecutions] = useState(0);
  const actions: IBulkAction<Contact>[] = [
    { id: "show", label: "Mostra selezionate", onAction: rows => setLastRows(rows.map(row => row.id)) },
    { id: "archive", label: "Archivia selezionate", clearSelectionOnSuccess: true,
      disabled: rows => rows.every(row => row.status === "Archiviato"),
      onAction: async rows => {
        setExecutions(value => value + 1);
        if (defer) await new Promise<void>(resolve => setTimeout(resolve, 650));
        if (reject) throw new Error("Archiviazione rifiutata");
        const ids = new Set(rows.map(row => row.id));
        setData(previous => previous.map(row => ids.has(row.id) ? { ...row, status: "Archiviato" } : row));
        setLastRows(rows.map(row => row.id));
      } },
  ];

  return <>
    <p>Salva una vista con filtri, ordine e colonne. Seleziona le righe per mostrare le azioni multiple.</p>
    <label><input type="checkbox" checked={unified} onChange={event => setUnified(event.target.checked)} />Query unificata</label>
    <label><input type="checkbox" checked={defer} onChange={event => setDefer(event.target.checked)} />Azione asincrona</label>
    <label><input type="checkbox" checked={reject} onChange={event => setReject(event.target.checked)} />Simula errore azione</label>
    <button type="button" onClick={() => setData(initialData)}>Ripristina contatti</button>
    <DynamicTable key={String(unified)} data={data} columns={columns} tableLabel="Contatti gestibili"
      query={unified ? query : undefined} onQueryChange={unified ? setQuery : undefined}
      globalSearch savedViews={{ key: "demo-contacts" }} bulkActions={actions}
      pagination={{ enabled: true, limit: 2, limitOptions: [2, 4, 6] }}
      enableColumnFilters enableColumnConfig enableColumnReorder isResizable stripedRows />
    <output aria-label="Ultime righe elaborate">{JSON.stringify(lastRows)}</output>
    <output aria-label="Esecuzioni azione">{executions}</output>
    {unified && <output aria-label="Query gestione">{JSON.stringify(query)}</output>}
  </>;
}
