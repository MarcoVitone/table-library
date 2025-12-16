import type { FC, MouseEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { ResizerHandle } from "./column-resizer.styles.ts";

interface IColumnResizerProps {
  onResizeEnd: (newWidth: number) => void;
  minWidth?: number;
}

const ColumnResizer: FC<IColumnResizerProps> = ({
  onResizeEnd,
  minWidth = 50,
}) => {
  // Stato per tracciare se stiamo trascinando
  const [isResizing, setIsResizing] = useState(false);

  // Ref per memorizzare i dati iniziali del drag (senza causare re-render)
  const resizeRef = useRef<{
    startX: number;
    startWidth: number;
    header: HTMLElement | null;
  }>({
    startX: 0,
    startWidth: 0,
    header: null,
  });

  // Gestione Lifecycle del Drag & Drop
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const { startX, startWidth, header } = resizeRef.current;
      if (!header) return;

      const diff = e.clientX - startX;
      const newWidth = Math.max(minWidth, startWidth + diff);

      // Aggiornamento DOM Diretto (Performance)
      header.style.width = `${newWidth}px`;
      header.style.minWidth = `${newWidth}px`;
      header.style.maxWidth = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      const { header } = resizeRef.current;

      // Reimposta il cursore del body
      document.body.style.cursor = "";

      // Salva nello stato finale
      if (header) {
        const finalWidth = header.getBoundingClientRect().width;
        onResizeEnd(finalWidth);
      }

      // Questo aggiornamento di stato scatenerà il 'return' (cleanup) dell'effect,
      // rimuovendo automaticamente i listener.
      setIsResizing(false);
    };

    // Aggiungi listener globali
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup automatico quando isResizing diventa false o il componente si smonta
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, onResizeEnd]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Trova la cella padre (th/td)
    const headerCell = e.currentTarget.closest("th, td") as HTMLElement;

    if (headerCell) {
      resizeRef.current = {
        startX: e.clientX,
        startWidth: headerCell.getBoundingClientRect().width,
        header: headerCell,
      };

      // Forza il cursore resize su tutto il documento durante il drag
      document.body.style.cursor = "col-resize";

      // Attiva l'effect dei listener
      setIsResizing(true);
    }
  };

  return (
    <ResizerHandle
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export { ColumnResizer };
