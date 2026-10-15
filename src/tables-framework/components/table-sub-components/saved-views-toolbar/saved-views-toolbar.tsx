import { useState } from "react";
import { useTable } from "../../../hooks/use-table/use-table";
import { useSavedViews } from "../../../hooks/use-saved-views/use-saved-views";
import type { ISavedTableView, ISavedViewsConfig, ITableViewState } from "../../../defines/saved-views.types";
import { cloneTableViewState, isTableViewState, reconcileTableViewState, tableViewSignature } from "../../../utils/saved-views/saved-views";
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

  return <section className="tbl-saved-views" aria-label="Gestione viste salvate">
    <div className="tbl-feature-toolbar">
      <label>Viste salvate <select value={selected?.id ?? ""} onChange={event => {
        const view = views.find(item => item.id === event.target.value);
        setSelectedId(view?.id ?? ""); setError(""); setMessage("");
        if (!view) return;
        apply(view);
      }}>
        <option value="">Seleziona una vista</option>
        {views.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
      </select></label>
      <Button size="small" disabled={!selected} onClick={() => { if (selected) apply(selected); }}>Applica vista</Button>
      <label>Nome vista <input value={name} maxLength={100} onChange={event => { setName(event.target.value); setError(""); }}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); save(false); } }} /></label>
      <Button size="small" onClick={() => save(false)}>Salva vista</Button>
      <Button size="small" disabled={!selected} onClick={() => save(true)}>Aggiorna vista</Button>
      <Button size="small" disabled={!selected} onClick={() => {
        changeViews(views.filter(view => view.id !== selectedId));
        setSelectedId(""); setName(""); setError(""); setMessage("Vista eliminata.");
      }}>Elimina vista</Button>
      {modified && <span>Vista modificata</span>}
    </div>
    {(error || storageError) && <div role="alert">{error || storageError}</div>}
    <div role="status">{message}</div>
  </section>;
}
