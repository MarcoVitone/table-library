import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { ResizerHandle } from "./column-resizer.styles.ts";

interface IColumnResizerProps {
  onResizeEnd: (newWidth: number, columnWidths?: Record<string, number>) => void;
  minWidth?: string | number;
}

const ColumnResizer: FC<IColumnResizerProps> = ({ onResizeEnd, minWidth = 50 }) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef({
    startX: 0,
    startWidth: 0,
    width: 0,
    minimum: 50,
    columnId: "",
    widths: {} as Record<string, number>,
    cells: [] as HTMLTableCellElement[],
    table: null as HTMLTableElement | null,
    previousCursor: "",
    restore: () => {},
  });

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      const resize = resizeRef.current;
      resize.width = Math.max(resize.minimum, resize.startWidth + event.clientX - resize.startX);
      resize.widths[resize.columnId] = resize.width;
      resize.cells.forEach((cell) => {
        const width = resize.widths[cell.dataset.columnId || ""];
        if (width === undefined) return;
        cell.style.width = width + "px";
        cell.style.minWidth = width + "px";
        cell.style.maxWidth = width + "px";
      });
      if (resize.table) {
        resize.table.querySelectorAll<HTMLTableColElement>("col[data-column-id]").forEach((column) => {
          const width = resize.widths[column.dataset.columnId || ""];
          if (width !== undefined) column.style.width = width + "px";
        });
        resize.table.style.width = Object.values(resize.widths).reduce((sum, width) => sum + width, 0) + "px";
      }
    };
    const handleMouseUp = () => {
      const resize = resizeRef.current;
      // Commit the requested size, not the table's redistributed measured width.
      resize.restore();
      onResizeEnd(resize.width, { ...resize.widths });
      setIsResizing(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      resizeRef.current.restore();
      document.body.style.cursor = resizeRef.current.previousCursor;
    };
  }, [isResizing, onResizeEnd]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const header = event.currentTarget.closest<HTMLTableCellElement>("th, td");
    const table = header?.closest("table");
    const columnId = header?.dataset.columnId;
    if (!header || !table || !columnId) return;
    const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>("thead [data-column-id]"))
      .filter((cell) => cell.colSpan === 1);
    const widths = Object.fromEntries(headers.map((cell) => [cell.dataset.columnId!, cell.getBoundingClientRect().width]));
    const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>("[data-column-id]"))
      .filter((cell) => cell.colSpan === 1);
    const computedMinimum = getComputedStyle(header).minWidth;
    const minimum = typeof minWidth === "number"
      ? minWidth
      : computedMinimum.endsWith("px") ? Number.parseFloat(computedMinimum) : 50;
    const elements = [...cells, ...table.querySelectorAll<HTMLTableColElement>("col[data-column-id]"), table];
    const originalStyles = elements.map((element) => ({
      element,
      width: element.style.width,
      minWidth: element.style.minWidth,
      maxWidth: element.style.maxWidth,
      tableLayout: element.style.tableLayout,
    }));
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      originalStyles.forEach(({ element, width, minWidth, maxWidth, tableLayout }) => {
        Object.assign(element.style, { width, minWidth, maxWidth, tableLayout });
      });
    };
    resizeRef.current = {
      startX: event.clientX,
      startWidth: header.getBoundingClientRect().width,
      width: header.getBoundingClientRect().width,
      minimum,
      columnId,
      widths,
      cells,
      table,
      previousCursor: document.body.style.cursor,
      restore,
    };
    cells.forEach((cell) => {
      const width = widths[cell.dataset.columnId || ""];
      if (width === undefined) return;
      cell.style.width = width + "px";
      cell.style.minWidth = width + "px";
      cell.style.maxWidth = width + "px";
    });
    table.style.width = Object.values(widths).reduce((sum, width) => sum + width, 0) + "px";
    table.style.tableLayout = "fixed";
    document.body.style.cursor = "col-resize";
    setIsResizing(true);
  };

  return (
    <ResizerHandle
      role="separator"
      aria-label="Ridimensiona colonna"
      aria-orientation="vertical"
      onMouseDown={handleMouseDown}
      onClick={(event) => event.stopPropagation()}
    />
  );
};

export { ColumnResizer };
