import { useTableLocalization } from "@/tables-framework/localization/use-table-localization";
import { AccessibilityElement } from "@/tables-framework/accessibility";
import { useState, useEffect, useEffectEvent, useRef } from "react";
import { useTable } from "../../../hooks/use-table/use-table";
import { useSavedViews } from "../../../hooks/use-saved-views/use-saved-views";
import type { ISavedTableView, ISavedViewsConfig, ITableViewState } from "../../../defines/saved-views.types";
import { cloneTableViewState, createTableViewUrl, parseTableViewUrl, isTableViewState, reconcileTableViewState, tableViewSignature } from "../../../utils/saved-views/saved-views";
import { Button } from "../../../ui/controls";

interface IProps {
  config: ISavedViewsConfig;
  search: string;
  pageSize: number;
  columns: { id: string; dataKey?: string; queryParam?: string }[];
  onApply: (view: ISavedTableView) => void;
}

export function SavedViewsToolbar({ config, search, pageSize, columns, onApply }: IProps) {
  const t = useTableLocalization();
  const { columnsLayout, sorting, filtering, setColumnsLayout, setSorting, setFiltering } = useTable();
  const { views, changeViews, error: storageError } = useSavedViews(config);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const lastSharedValue = useRef<string | null>(null);
  const shareParameter = config.share
    ? (typeof config.share === "object" ? config.share.parameter : undefined) ?? `tableView.${config.key}` : null;
  const selected = views.find(view => view.id === selectedId);
  const snapshot: ITableViewState = { columnsLayout: columnsLayout ?? [], sorting: sorting ?? [], filters: filtering ?? [], search, pageSize };
  const modified = selected && isTableViewState(selected.state)
    && tableViewSignature(snapshot) !== tableViewSignature(reconcileTableViewState(selected.state, columns));

  const save = (replace: boolean) => {
    const trimmed = name.trim();
    setError(""); setMessage("");
    if (!trimmed) { setError(t("views.nameRequired")); return; }
    if (views.some(view => view.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() && (!replace || view.id !== selected?.id))) {
      setError(t("views.duplicate")); return;
    }
    if (replace && !selected) return;
    const view: ISavedTableView = { id: replace && selected ? selected.id
      : globalThis.crypto?.randomUUID?.() ?? `view-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmed, state: cloneTableViewState(snapshot) };
    changeViews(replace ? views.map(item => item.id === view.id ? view : item) : [...views, view]);
    setSelectedId(view.id); setName(view.name);
    setMessage(replace ? t("views.updated") : t("views.saved"));
  };

  const apply = (view: ISavedTableView) => {
    setError(""); setMessage("");
    if (!isTableViewState(view.state)) { setError(t("views.invalid")); return; }
    const applied = { ...view, state: reconcileTableViewState(view.state, columns) };
    setColumnsLayout?.(applied.state.columnsLayout);
    setSorting?.(applied.state.sorting);
    setFiltering?.(applied.state.filters);
    onApply(applied);
    config.onViewApply?.(applied);
    setName(view.name); setMessage(t("views.applied"));
  };

  const restoreSharedView = useEffectEvent(() => {
    if (shareParameter === null) return;
    const value = JSON.stringify([shareParameter, new URL(window.location.href).searchParams.get(shareParameter)]);
    if (value === lastSharedValue.current) return;
    lastSharedValue.current = value;
    try {
      const state = parseTableViewUrl(window.location.href, shareParameter);
      if (state) {
        apply({ id: "shared", name: t("views.sharedName"), state });
        setSelectedId("");
        setMessage(t("views.sharedApplied"));
      }
    } catch {
      setError(t("views.invalidLink"));
    }
  });
  useEffect(() => {
    // Import the external browser snapshot after the table context has mounted.
    // The URL token guard prevents repeated application (including Strict Mode).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    restoreSharedView();
    const onPopState = () => restoreSharedView();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [shareParameter]);

  const share = async () => {
    setError(""); setMessage("");
    try {
      const url = createTableViewUrl(window.location.href, snapshot, shareParameter!);
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setMessage(t("views.copied"));
      } catch {
        setMessage(t("views.manualCopy"));
      }
    } catch {
      setError(t("views.shareFailed"));
    }
  };

  return <AccessibilityElement as="section" slot="savedViews" className="tbl-saved-views" aria-label={t("a11y.savedViews")}>
    <div className="tbl-feature-toolbar">
      <AccessibilityElement as="label" slot="savedViewSelectLabel">{t("views.select")} <AccessibilityElement as="select" slot="savedViewSelect" value={selected?.id ?? ""} onChange={event => {
        const view = views.find(item => item.id === event.target.value);
        setSelectedId(view?.id ?? ""); setError(""); setMessage("");
        if (!view) return;
        apply(view);
      }}>
        <option value="">{t("views.selectPlaceholder")}</option>
        {views.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
      </AccessibilityElement></AccessibilityElement>
      <Button accessibilitySlot="savedViewApplyButton" size="small" disabled={!selected} onClick={() => { if (selected) apply(selected); }}>{t("views.apply")}</Button>
      <AccessibilityElement as="label" slot="savedViewNameLabel">{t("views.name")} <AccessibilityElement as="input" slot="savedViewName" value={name} maxLength={100} onChange={event => { setName(event.target.value); setError(""); }}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); save(false); } }} /></AccessibilityElement>
      <Button accessibilitySlot="savedViewSaveButton" size="small" onClick={() => save(false)}>{t("views.save")}</Button>
      <Button accessibilitySlot="savedViewUpdateButton" size="small" disabled={!selected} onClick={() => save(true)}>{t("views.update")}</Button>
      <Button accessibilitySlot="savedViewDeleteButton" size="small" disabled={!selected} onClick={() => {
        changeViews(views.filter(view => view.id !== selectedId));
        setSelectedId(""); setName(""); setError(""); setMessage(t("views.deleted"));
      }}>{t("views.delete")}</Button>
      {config.share && <Button accessibilitySlot="savedViewShareButton" size="small" onClick={share}>{t("views.share")}</Button>}
      {modified && <span>{t("views.modified")}</span>}
    </div>
    {config.share && shareUrl && <AccessibilityElement as="label" slot="savedViewLinkLabel">{t("views.link")}
      <AccessibilityElement as="input" slot="savedViewLink" readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} />
    </AccessibilityElement>}
    {(error || storageError) && <AccessibilityElement as="div" slot="savedViewError" role="alert">{error || storageError}</AccessibilityElement>}
    <AccessibilityElement as="div" slot="savedViewStatus" role="status">{message}</AccessibilityElement>
  </AccessibilityElement>;
}
