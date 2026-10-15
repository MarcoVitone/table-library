import { DragIndicator } from "@/tables-framework/ui/icons";
import { IconButton } from "@/tables-framework/ui/controls";
import type { DragEvent } from "react";
import { useState } from "react";
import { useTable } from "@/tables-framework/hooks/use-table/use-table";

interface IDraggableButton {
  isDomDraggable?: boolean;
  handleDragStart?: (e: DragEvent<HTMLElement>) => void;
  handleDragEnd?: (e: DragEvent<HTMLElement>) => void;
  handleStyle?: React.CSSProperties;
}
const DraggableButton = ({
  isDomDraggable,
  handleDragStart,
  handleDragEnd,
  handleStyle,
}: IDraggableButton) => {
  const { columnsLayout, setColumnsLayout } = useTable();
  const [announcement, setAnnouncement] = useState("");
  return (
    <>
    <IconButton
      aria-label="Trascina colonna"
      title="Sposta colonna con Alt e freccia sinistra/destra"
      aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
      className="drag-handle"
      draggable={isDomDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={handleStyle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
          e.preventDefault();
          e.stopPropagation();
          const header = e.currentTarget.closest<HTMLTableCellElement>("th, td");
          const id = header?.dataset.columnId;
          if (!id || !columnsLayout || !setColumnsLayout) return;
          const movable = columnsLayout.filter(column => !column.props.isHidden
            && header.closest("table")?.querySelector(`[data-column-id="${CSS.escape(column.id)}"] .drag-handle`));
          const index = movable.findIndex(column => column.id === id);
          const target = movable[index + (e.key === "ArrowLeft" ? -1 : 1)];
          if (!target) return;
          const next = [...columnsLayout];
          const from = next.findIndex(column => column.id === id);
          const to = next.findIndex(column => column.id === target.id);
          [next[from], next[to]] = [next[to], next[from]];
          setColumnsLayout(next);
          setAnnouncement(`Colonna spostata alla posizione ${index + (e.key === "ArrowLeft" ? 0 : 2)}`);
        }
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <DragIndicator fontSize="small" />
    </IconButton>
    <span className="tbl-sr-only" role="status">{announcement}</span>
    </>
  );
};

export { DraggableButton };
