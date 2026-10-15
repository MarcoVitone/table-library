import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DynamicTable, type IColumnConfig } from "../../src/tables-framework/components/dynamic-table/dynamic-table";
import { useTable } from "../../src/tables-framework/hooks/use-table/use-table";

interface Row { uuid: string; id: number; _id: number; profile: { name: string }; date: string | null; note: string }
const initialRows: Row[] = [
  { uuid: "u1", id: 1, _id: 2, profile: { name: "Alpha" }, date: null, note: 'Rossi, Marco;\n"50%"' },
  { uuid: "u2", id: 2, _id: 3, profile: { name: "Beta" }, date: "invalid-date", note: "Other" },
];
const columns: IColumnConfig<Row>[] = [
  { id: "id", label: "ID", type: "number", width: 90 },
  { id: "name", label: "Name", dataKey: "profile.name", type: "input", width: 180, fixed: true },
  { id: "date", label: "Date", type: "date", width: 160 },
  { id: "note", label: "Note", width: 280, fixed: true },
  { id: "selection", label: "Select", type: "checkbox", width: 60 },
];
export function Controls() {
  const api = useTable();
  return <div>
    <button onClick={() => api.selectAllRows()}>Select all</button>
    <button onClick={() => api.exportCSV?.()}>Export CSV</button>
  </div>;
}
export function Selection() {
  const api = useTable();
  return <output aria-label="Selected">{api.selectedRows?.length ?? 0}</output>;
}
export function App() {
  const [data, setData] = useState(initialRows);
  const [idKey, setIdKey] = useState("uuid");
  return <div style={{ width: 480 }}>
    <button onClick={() => setIdKey("id")}>Use id</button>
    <DynamicTable data={data} columns={columns} idKey={idKey} maxHeight={240} isResizable
      enableColumnReorder enableColumnConfig tableLabel="Regression"
      pagination={{ enabled: true, limit: 5, persistence: { enabled: true, key: "review-browser" } }}
      onDataChange={next => setData(next)} before={<Controls />} after={<Selection />} />
    <output aria-label="Records">{JSON.stringify(data)}</output>
  </div>;
}
createRoot(document.getElementById("root")!).render(<App />);
