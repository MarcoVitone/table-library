import { useCallback, useState, useEffect, useRef } from "react";
import type { DragEvent } from "react";
import { useTable } from "../use-table/use-table";

interface IUseColumnDragParams {
  columnId: string;
  enabled: boolean;
}

export const useColumnDrag = ({ columnId, enabled }: IUseColumnDragParams) => {
  const { columnsLayout, setColumnsLayout } = useTable();

  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const ghostImageTimeoutRef = useRef<number | null>(null);

  // --- FIX ---
  // Questo effect serve SOLO a resettare lo stato quando avviene un Drop (cambia il layout).
  // Abbiamo rimosso 'isDragging' e 'isOver' dalle dipendenze per evitare il loop
  // che spegneva subito la grafica.
  useEffect(() => {
    // Reset asincrono per evitare errori di render durante l'aggiornamento del layout
    const timer = setTimeout(() => {
      setIsDragging(false);
      setIsOver(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [columnsLayout]); // <--- ARRAY DIPENDENZE MINIMO (Solo layout)

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (ghostImageTimeoutRef.current)
        clearTimeout(ghostImageTimeoutRef.current);

      e.dataTransfer.setData("application/table-column-id", columnId);
      e.dataTransfer.effectAllowed = "move";

      // Ritardo per permettere al browser di generare l'immagine fantasma
      // prima che applichiamo l'opacità all'elemento reale.
      ghostImageTimeoutRef.current = globalThis.setTimeout(() => {
        setIsDragging(true); // Attiva la grafica
        ghostImageTimeoutRef.current = null;
      }, 0);
    },
    [columnId]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIsOver(false);

    if (ghostImageTimeoutRef.current) {
      clearTimeout(ghostImageTimeoutRef.current);
      ghostImageTimeoutRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOver(true); // Attiva il bordo colorato di destinazione
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      // Non resettiamo qui, lasciamo che lo faccia l'useEffect su [columnsLayout]
      // o l'handleDragEnd.
      setIsOver(false);

      const sourceId = e.dataTransfer.getData("application/table-column-id");

      if (!sourceId || sourceId === columnId) return;
      if (!columnsLayout || !setColumnsLayout) return;

      const currentLayout = [...columnsLayout];
      const sourceIndex = currentLayout.findIndex((c) => c.id === sourceId);
      const targetIndex = currentLayout.findIndex((c) => c.id === columnId);

      if (sourceIndex > -1 && targetIndex > -1) {
        const [movedColumn] = currentLayout.splice(sourceIndex, 1);
        currentLayout.splice(targetIndex, 0, movedColumn);

        setColumnsLayout(currentLayout);
      }
    },
    [columnId, columnsLayout, setColumnsLayout]
  );

  if (!enabled) {
    return {
      dragProps: {},
      isDragging: false,
      isOver: false,
    };
  }

  return {
    dragProps: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
    },
    isDragging,
    isOver,
  };
};
