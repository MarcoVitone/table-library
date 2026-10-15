import { useState } from "react";
import { DynamicTable, type IColumnConfig } from "@/tables-framework/components/dynamic-table/dynamic-table";

interface Person { id: number; name: string; email: string; address: { city: string } }
const data: Person[] = [
  { id: 1, name: "Marco Rossi", email: "marco@example.it", address: { city: "Roma" } },
  { id: 2, name: "Anna Bianchi", email: "anna@example.it", address: { city: "Milano" } },
  { id: 3, name: "Giulia Verdi", email: "giulia@example.it", address: { city: "Roma" } },
  { id: 4, name: "José Neri", email: "jose@example.it", address: { city: "Torino" } },
];
const columns: IColumnConfig<Person>[] = [
  { id: "name", label: "Nome", headerProps: { sortable: true }, filterConfig: { type: "text" } },
  { id: "email", label: "Email" },
  { id: "city", dataKey: "address.city", label: "Città", filterConfig: { type: "text" } },
];

export function GlobalSearchTable() {
  const [namesOnly, setNamesOnly] = useState(false);
  return <>
    <p>Cerca nome, email e città con un unico campo. Prova “Marco Roma” oppure “jose”.</p>
    <label><input type="checkbox" checked={namesOnly} onChange={event => setNamesOnly(event.target.checked)} />Cerca solo nei nomi</label>
    <DynamicTable data={data} columns={columns} tableLabel="Contatti"
      globalSearch={namesOnly ? { columns: ["name"] } : true}
      pagination={{ enabled: true, limitOptions: [2, 4] }} enableColumnFilters stripedRows />
  </>;
}
