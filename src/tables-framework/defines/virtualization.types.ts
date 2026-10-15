export interface IVirtualizationConfig {
  /** Scroll viewport height. Defaults to 400px (or DynamicTable maxHeight). */
  height?: number | string;
  /** Estimated/default row height in pixels. Actual heights are measured. Default: 48. */
  rowHeight?: number;
  /** Extra rows mounted before and after the visible range. Default: 5. */
  overscan?: number;
}

export type TVirtualization = boolean | IVirtualizationConfig;
