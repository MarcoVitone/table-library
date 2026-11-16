import { useContext, useMemo, type ReactNode } from "react";
import type { ITableLocalization } from "./messages";
import { LocalizationContext } from "./use-table-localization";

export function TableLocalizationProvider({ value, children }: { value: ITableLocalization; children: ReactNode }) {
  const inherited = useContext(LocalizationContext);
  const config = useMemo(() => ({ ...inherited, ...value, messages: { ...inherited.messages, ...value.messages } }), [inherited, value]);
  return <LocalizationContext.Provider value={config}>{children}</LocalizationContext.Provider>;
}

