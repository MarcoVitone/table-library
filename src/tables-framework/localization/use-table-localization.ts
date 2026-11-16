import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { createTableTranslator, type ITableLocalization } from "./messages";

export const LocalizationContext = /* @__PURE__ */ createContext<ITableLocalization>({});

function detectedLocale() {
  return (typeof document !== "undefined" && document.documentElement.lang.trim()) ||
    (typeof window !== "undefined" && window.navigator.language) || "en";
}

const localeListeners = new Set<() => void>();
let stopLocaleSubscription: (() => void) | undefined;

function subscribeLocale(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  localeListeners.add(onChange);
  // One observer for the entire library, including large tables and portals.
  if (!stopLocaleSubscription) {
    const notify = () => localeListeners.forEach(listener => listener());
    window.addEventListener("languagechange", notify);
    const observer = typeof MutationObserver !== "undefined" ? new MutationObserver(notify) : undefined;
    if (typeof document !== "undefined") observer?.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    stopLocaleSubscription = () => { window.removeEventListener("languagechange", notify); observer?.disconnect(); };
  }
  return () => {
    localeListeners.delete(onChange);
    if (!localeListeners.size) { stopLocaleSubscription?.(); stopLocaleSubscription = undefined; }
  };
}

export function useTableLocalization(value?: ITableLocalization) {
  const inherited = useContext(LocalizationContext);
  const locale = useSyncExternalStore(subscribeLocale, detectedLocale, () => "en");
  return useMemo(() => createTableTranslator({ locale, ...(value ? {
    ...inherited, ...value, messages: { ...inherited.messages, ...value.messages },
  } : inherited) }), [inherited, value, locale]);
}
