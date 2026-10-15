import { DragIndicator } from "@/tables-framework/ui/icons";
import { IconButton } from "@/tables-framework/ui/controls";
import type { DragEvent } from "react";

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
  return (
    <IconButton
      aria-label="Trascina colonna"
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <DragIndicator fontSize="small" />
    </IconButton>
  );
};

export { DraggableButton };
