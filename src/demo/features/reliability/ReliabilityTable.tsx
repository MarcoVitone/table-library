import { useEffect, useState } from "react";
import { DynamicTable, type IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";
import type { ITableQuery } from "@/tables-framework/defines/query.types";

interface RecordRow { id: number; name: string }
const records = ["Zoe", "Anna", "Marco", "Bruno", "Carla", "Dario", "Elena"].map((name, id) => ({ id, name }));
const columns: IColumnConfig<RecordRow>[] = [{ id: "name", label: "Nome", dataKey: "name", fixed: true,
  headerProps: { sortable: true }, filterConfig: { type: "text" } }];

export function ReliabilityTable() {
  const [query, setQuery] = useState<ITableQuery>({ page: 0, pageSize: 2, sorting: [], filters: [] });
  const [data, setData] = useState<RecordRow[]>([]);
  const [total, setTotal] = useState(records.length);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [queryChanges, setQueryChanges] = useState(0);
  const [scenario, setScenario] = useState<"data" | "empty" | "error" | "loading">("data");
  // Simulated server request. Cleanup prevents stale responses replacing newer results.
  useEffect(() => {
    if (scenario === "loading") return;
    const timer = setTimeout(() => {
      if (scenario === "error") {
        setError("Impossibile caricare i dati");
      } else {
        let result = scenario === "empty" ? [] : records.filter(row => query.filters.every(filter =>
          row.name.toLowerCase().includes(String(filter.val).toLowerCase()))
          && (query.search ?? "").trim().toLowerCase().split(/\s+/).every(word => row.name.toLowerCase().includes(word)));
        if (query.sorting.length) result = [...result].sort((a, b) =>
          a.name.localeCompare(b.name) * (query.sorting[0].dir === "asc" ? 1 : -1));
        setTotal(result.length);
        setData(result.slice(query.page * query.pageSize, (query.page + 1) * query.pageSize));
        setError(null);
      }
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, attempt, scenario]);

  return <>
    <p>Pagina, filtri e ordinamento sono gestiti da un server simulato.</p>
    <label>Scenario <select aria-label="Scenario" value={scenario} onChange={event => {
      setScenario(event.target.value as typeof scenario);
      setIsLoading(true);
      setError(null);
      setQuery({ page: 0, pageSize: 2, sorting: [], filters: [] });
    }}>
      <option value="data">Dati disponibili</option><option value="empty">Nessun dato</option>
      <option value="error">Errore</option><option value="loading">Caricamento</option>
    </select></label>
    <button type="button" onClick={() => { setQuery({ page: 2, pageSize: 2, sorting: [], filters: [] }); setIsLoading(true); }}>Imposta pagina esterna</button>
    <DynamicTable columns={columns} data={data} dataMode="server" totalItems={total} query={query}
      onQueryChange={next => { setQuery(next); setQueryChanges(count => count + 1); setIsLoading(true); }}
      isLoading={isLoading} error={error} onRetry={() => { setScenario("data"); setAttempt(value => value + 1); setIsLoading(true); }}
      pagination={{ enabled: true, limitOptions: [2, 5] }} enableColumnFilters enableColumnReorder isResizable
      tableLabel="Risultati server" globalSearch savedViews={{ key: "demo-server" }} stripedRows />
    <output aria-label="Query corrente">{JSON.stringify(query)}</output>
    <output aria-label="Cambi query">{queryChanges}</output>
  </>;
}
