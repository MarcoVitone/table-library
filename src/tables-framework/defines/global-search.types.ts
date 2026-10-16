export interface IGlobalSearchConfig {
  /** Data keys to search, including nested paths. Defaults to all data columns. */
  columns?: string[];
  label?: string;
  placeholder?: string;
  /** Controlled value when the unified query API is not used. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export type TGlobalSearch = boolean | IGlobalSearchConfig;
