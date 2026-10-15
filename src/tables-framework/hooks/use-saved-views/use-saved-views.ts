import { useState } from "react";
import type { ISavedTableView, ISavedViewsConfig } from "../../defines/saved-views.types";
import { parseSavedViews, serializeSavedViews } from "../../utils/saved-views/saved-views";

export function useSavedViews(config: ISavedViewsConfig) {
  const storageKey = `table_views_${config.key}`;
  const storage = config.storage ?? "localStorage";
  const [initial] = useState(() => {
    if (config.views || storage === false || typeof window === "undefined") return { views: config.defaultViews ?? [], error: "" };
    try {
      const text = window[storage].getItem(storageKey);
      return { views: text ? parseSavedViews(text) : config.defaultViews ?? [], error: "" };
    } catch {
      return { views: config.defaultViews ?? [], error: "Impossibile leggere le viste salvate." };
    }
  });
  const [internalViews, setInternalViews] = useState(initial.views);
  const [error, setError] = useState(initial.error);
  const views = config.views ?? internalViews;
  const changeViews = (next: ISavedTableView[]) => {
    setError("");
    if (!config.views) {
      setInternalViews(next);
      if (storage !== false && typeof window !== "undefined") {
        try { window[storage].setItem(storageKey, serializeSavedViews(next)); }
        catch { setError("Viste aggiornate in memoria. Impossibile salvarle nel browser."); }
      }
    }
    config.onViewsChange?.(next);
  };
  return { views, changeViews, error };
}
