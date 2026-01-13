import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { DemoNavigation, type TDemoPage } from "./components/DemoNavigation";
import { BasicTable } from "./features/basic/BasicTable";
import { PaginationTable } from "./features/pagination/PaginationTable";
import { SortingFilteringTable } from "./features/sorting-filtering/SortingFilteringTable";
import { CustomCellsTable } from "./features/custom-cells/CustomCellsTable";
import { SelectionTable } from "./features/selection/SelectionTable";
import { DraggableTable } from "./features/draggable/DraggableTable";
import { ResizableTable } from "./features/resizable/ResizableTable";
import { CollapsibleTable } from "./features/collapsible/CollapsibleTable";
import { ColumnConfigTable } from "./features/column-config/ColumnConfigTable";

const DemoApp: FC = () => {
  const [activePage, setActivePage] = useState<TDemoPage>("basic");
  const content = useMemo(() => {
    switch (activePage) {
      case "basic":
        return <BasicTable />;
      case "pagination":
        return <PaginationTable />;
      case "sorting-filtering":
        return <SortingFilteringTable />;
      case "custom-cells":
        return <CustomCellsTable />;
      case "selection":
        return <SelectionTable />;
      case "draggable":
        return <DraggableTable />;
      case "resizable":
        return <ResizableTable />;
      case "collapsible":
        return <CollapsibleTable />;
      case "column-config":
        return <ColumnConfigTable />;
      default:
        return <div>Seleziona una demo</div>;
    }
  }, [activePage]);

  const onNavigate = useCallback((page: TDemoPage) => {
    setActivePage(page);
  }, []);
  return (
    <div style={{ padding: "1rem" }}>
      <h1>Framework Tabelle - Demo</h1>
      <DemoNavigation activePage={activePage} onNavigate={onNavigate} />
      <div style={{ marginTop: "1rem" }}>{content}</div>
    </div>
  );
};

export default DemoApp;
