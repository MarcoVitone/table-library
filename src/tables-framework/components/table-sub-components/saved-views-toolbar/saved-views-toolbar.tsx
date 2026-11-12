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
    if (!trimmed) { setError("Inserisci un nome per la vista."); return; }
    if (views.some(view => view.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() && (!replace || view.id !== selected?.id))) {
      setError("Esiste già una vista con questo nome."); return;
    }
    if (replace && !selected) return;
    const view: ISavedTableView = { id: replace && selected ? selected.id
      : globalThis.crypto?.randomUUID?.() ?? `view-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmed, state: cloneTableViewState(snapshot) };
    changeViews(replace ? views.map(item => item.id === view.id ? view : item) : [...views, view]);
    setSelectedId(view.id); setName(view.name);
    setMessage(replace ? "Vista aggiornata." : "Vista salvata.");
  };

  const apply = (view: ISavedTableView) => {
    setError(""); setMessage("");
    if (!isTableViewState(view.state)) { setError("La vista contiene una configurazione non valida."); return; }
    const applied = { ...view, state: reconcileTableViewState(view.state, columns) };
    setColumnsLayout?.(applied.state.columnsLayout);
    setSorting?.(applied.state.sorting);
    setFiltering?.(applied.state.filters);
    onApply(applied);
    config.onViewApply?.(applied);
    setName(view.name); setMessage("Vista applicata.");
  };

  const restoreSharedView = useEffectEvent(() => {
    if (shareParameter === null) return;
    const value = JSON.stringify([shareParameter, new URL(window.location.href).searchParams.get(shareParameter)]);
    if (value === lastSharedValue.current) return;
    lastSharedValue.current = value;
    try {
      const state = parseTableViewUrl(window.location.href, shareParameter);
      if (state) {
        apply({ id: "shared", name: "Vista condivisa", state });
        setSelectedId("");
        setMessage("Vista condivisa applicata.");
      }
    } catch {
      setError("Il link contiene una vista non valida o non supportata.");
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
        setMessage("Link copiato.");
      } catch {
        setMessage("Copia il link dal campo Link alla vista.");
      }
    } catch {
      setError("Impossibile creare il link alla vista.");
    }
  };

  return <AccessibilityElement as="section" slot="savedViews" className="tbl-saved-views" aria-label="Gestione viste salvate">
    <div className="tbl-feature-toolbar">
      <AccessibilityElement as="label" slot="savedViewSelectLabel">Viste salvate <AccessibilityElement as="select" slot="savedViewSelect" value={selected?.id ?? ""} onChange={event => {
        const view = views.find(item => item.id === event.target.value);
        setSelectedId(view?.id ?? ""); setError(""); setMessage("");
        if (!view) return;
        apply(view);
      }}>
        <option value="">Seleziona una vista</option>
        {views.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
      </AccessibilityElement></AccessibilityElement>
      <Button accessibilitySlot="savedViewApplyButton" size="small" disabled={!selected} onClick={() => { if (selected) apply(selected); }}>Applica vista</Button>
      <AccessibilityElement as="label" slot="savedViewNameLabel">Nome vista <AccessibilityElement as="input" slot="savedViewName" value={name} maxLength={100} onChange={event => { setName(event.target.value); setError(""); }}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); save(false); } }} /></AccessibilityElement>
      <Button accessibilitySlot="savedViewSaveButton" size="small" onClick={() => save(false)}>Salva vista</Button>
      <Button accessibilitySlot="savedViewUpdateButton" size="small" disabled={!selected} onClick={() => save(true)}>Aggiorna vista</Button>
      <Button accessibilitySlot="savedViewDeleteButton" size="small" disabled={!selected} onClick={() => {
        changeViews(views.filter(view => view.id !== selectedId));
        setSelectedId(""); setName(""); setError(""); setMessage("Vista eliminata.");
      }}>Elimina vista</Button>
      {config.share && <Button accessibilitySlot="savedViewShareButton" size="small" onClick={share}>Condividi vista</Button>}
      {modified && <span>Vista modificata</span>}
    </div>
    {config.share && shareUrl && <AccessibilityElement as="label" slot="savedViewLinkLabel">Link alla vista
      <AccessibilityElement as="input" slot="savedViewLink" readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} />
    </AccessibilityElement>}
    {(error || storageError) && <AccessibilityElement as="div" slot="savedViewError" role="alert">{error || storageError}</AccessibilityElement>}
    <AccessibilityElement as="div" slot="savedViewStatus" role="status">{message}</AccessibilityElement>
  </AccessibilityElement>;
}
