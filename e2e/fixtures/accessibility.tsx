import { useState } from "react";
import { createRoot } from "react-dom/client";
import { DynamicTable } from "../../src/tables-framework/components/dynamic-table/dynamic-table";
import { AccessibilityProvider } from "../../src/tables-framework/accessibility";
import { Chip, Checkbox } from "../../src/tables-framework/ui/controls";
import { SortingCell } from "../../src/tables-framework/components/cells/sorting-cell/sorting-cell";

export function App() {
  const mode = new URLSearchParams(location.search).get("mode");
  const [changes, setChanges] = useState(0);
  const [data, setData] = useState([{ id: 0, name: "Anna" }, { id: 1, name: "Marco" }]);
  return <AccessibilityProvider value={mode === "custom" ? { slotProps: {
    sortButton: { "aria-label": "Custom sort" },
    pasteOpenButton: { children: "Custom paste" },
    pasteContent: { "aria-label": "Custom content" },
    pastePreviewCell: ({ area, index }) => ({ "data-preview": `${area}-${index}` }),
    checkbox: { onChange: () => setChanges(value => value + 1) },
  } } : mode === "off" ? { useDefaults: false } : undefined}>
    <Checkbox aria-label="Probe" checked={false} onChange={() => setChanges(99)} />
    <output>{changes}</output>
    <Chip label="Tag" onDelete={() => {}} />
    <DynamicTable data={data} columns={mode === "legacy" ? [{ id: "name", label: "Customer", type: "custom", component: SortingCell, bodyProps: { isServerSide: false } }] : [{ id: "name", label: "Customer", type: "input", headerProps: { sortable: true } }]}
      localization={mode === "explicit" ? { locale: "en" } : undefined}
      enableColumnConfig enableColumnFilters enableColumnReorder isResizable globalSearch
      excelPaste={{ onApply: next => setData(next) }} pagination={{ enabled: true, limit: 1, limitOptions: [1, 2] }} />
  </AccessibilityProvider>;
}
createRoot(document.getElementById("root")!).render(<App />);
