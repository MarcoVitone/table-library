import { useLayoutEffect, useMemo, useState, type RefObject } from "react";
import type { IRow } from "../../defines/common.types";
import type { TVirtualization } from "../../defines/virtualization.types";

export function normalizeVirtualization(value?: TVirtualization) {
  const config = typeof value === "object" ? value : {};
  return {
    enabled: !!value,
    height: config.height ?? 400,
    rowHeight: Number.isFinite(config.rowHeight) ? Math.max(1, config.rowHeight!) : 48,
    overscan: Number.isFinite(config.overscan) ? Math.max(0, Math.floor(config.overscan!)) : 5,
  };
}

export function findVirtualRow(offsets: number[], position: number) {
  let low = 0;
  let high = Math.max(0, offsets.length - 2);
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (offsets[middle + 1] <= position) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function virtualRange(offsets: number[], scrollTop: number, viewportHeight: number, bodyOffset: number, stickyHeight: number, overscan: number) {
  const count = offsets.length - 1;
  if (!count) return { start: 0, end: 0 };
  const first = findVirtualRow(offsets, Math.max(0, scrollTop - bodyOffset + stickyHeight));
  const last = findVirtualRow(offsets, Math.max(0, scrollTop + viewportHeight - bodyOffset - 0.01));
  return { start: Math.max(0, first - overscan), end: Math.min(count, Math.max(first, last) + 1 + overscan) };
}

export function useVirtualRows(rows: IRow[], value: TVirtualization | undefined, stickyHeader: boolean, layoutKey: string, viewportRef: RefObject<HTMLDivElement | null>) {
  const config = useMemo(() => normalizeVirtualization(value), [value]);
  const { enabled, rowHeight, overscan, height } = config;
  const [metrics, setMetrics] = useState({ scrollTop: 0, height: typeof height === "number" ? height : 400, bodyOffset: 0, headerHeight: 0 });
  const cacheKey = `${rowHeight}:${layoutKey}`;
  const [measurements, setMeasurements] = useState({ key: cacheKey, heights: new Map<string, number>() });
  if (measurements.key !== cacheKey) setMeasurements({ key: cacheKey, heights: new Map() });
  const rowIds = useMemo(() => enabled ? rows.map(row => row.id) : [], [rows, enabled]);
  const rowsKey = useMemo(() => JSON.stringify(rowIds), [rowIds]);
  const offsets = useMemo(() => {
    const result = [0];
    for (const id of rowIds) result.push(result[result.length - 1] + (measurements.heights.get(id) ?? rowHeight));
    return result;
  }, [rowIds, rowHeight, measurements]);
  const range = enabled
    ? virtualRange(offsets, metrics.scrollTop, metrics.height, metrics.bodyOffset, stickyHeader ? metrics.headerHeight : 0, overscan)
    : { start: 0, end: rows.length };

  // A new filtered/sorted page starts at its first record; scrolling alone never resets it.
  useLayoutEffect(() => {
    if (enabled && viewportRef.current) viewportRef.current.scrollTop = 0;
  }, [enabled, rowsKey, viewportRef]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || !viewport) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const header = viewport.querySelector("thead");
      const body = viewport.querySelector("tbody");
      const next = {
        scrollTop: viewport.scrollTop,
        height: viewport.clientHeight,
        bodyOffset: body ? viewport.scrollTop + body.getBoundingClientRect().top - viewport.getBoundingClientRect().top - viewport.clientTop : 0,
        headerHeight: header?.getBoundingClientRect().height ?? 0,
      };
      setMetrics(previous => Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(viewport);
    const header = viewport.querySelector("thead");
    if (header) observer.observe(header);
    viewport.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      viewport.removeEventListener("scroll", schedule);
    };
  }, [enabled, rowsKey, viewportRef]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || !viewport) return;
    const observer = new ResizeObserver(entries => {
      const updates = new Map<string, number>();
      let correction = 0;
      let totalDelta = 0;
      const wasAtEnd = viewport.scrollTop > 0
        && viewport.scrollTop + viewport.clientHeight >= metrics.bodyOffset + offsets[offsets.length - 1] - 1;
      const first = findVirtualRow(offsets, Math.max(0, viewport.scrollTop - metrics.bodyOffset + (stickyHeader ? metrics.headerHeight : 0)));
      for (const entry of entries) {
        const element = entry.target as HTMLTableRowElement;
        const id = element.dataset.virtualRow;
        const index = Number(element.dataset.virtualIndex);
        const measuredHeight = element.getBoundingClientRect().height;
        const previousHeight = id ? measurements.heights.get(id) ?? rowHeight : rowHeight;
        if (id && measuredHeight > 0 && Math.abs(measuredHeight - previousHeight) > 0.5) {
          updates.set(id, measuredHeight);
          totalDelta += measuredHeight - previousHeight;
          if (index < first) correction += measuredHeight - previousHeight;
        }
      }
      if (!updates.size) return;
      if (wasAtEnd) correction = totalDelta;
      if (correction) viewport.scrollTop += correction;
      setMeasurements(previous => ({ key: cacheKey, heights: new Map([...previous.heights, ...updates]) }));
    });
    viewport.querySelectorAll("tbody > tr[data-virtual-row]").forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, [enabled, range.start, range.end, rows, rowHeight, cacheKey, offsets, measurements, metrics.bodyOffset, metrics.headerHeight, stickyHeader, viewportRef]);

  return { ...config, ...range, offsets };
}
