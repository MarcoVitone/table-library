import { useState, useRef, useId, useLayoutEffect, useEffect, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { useTheme, themeVariables } from "../theme/theme";
import { IconButton } from "./controls";
import { Close, KeyboardArrowDown } from "./icons";
export type AutocompleteOption = string | Record<string, unknown>;
interface Props {
  value: AutocompleteOption | null;
  onChange: (event: SyntheticEvent, value: AutocompleteOption | null) => void;
  options: AutocompleteOption[];
  getOptionLabel: (option: AutocompleteOption) => string;
  isOptionEqualToValue?: (option: AutocompleteOption, value: AutocompleteOption) => boolean;
  disableClearable?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onCancel?: () => void;
}
export function Autocomplete({
  value,
  onChange,
  options,
  getOptionLabel,
  isOptionEqualToValue = (a, b) => a === b,
  disableClearable = false,
  placeholder,
  label,
  disabled = false,
  invalid,
  describedBy,
  onCancel,
}: Props) {
  const labelOf = (option: AutocompleteOption | null) => option === null ? '' : getOptionLabel(option);
  const [previousValue, setPreviousValue] = useState(value);
  const [query, setQuery] = useState(labelOf(value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  if (!Object.is(value, previousValue)) {
    setPreviousValue(value);
    setQuery(labelOf(value));
  }
  const theme = useTheme();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const filtered = options.filter(option => getOptionLabel(option).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const activeIndex = Math.min(active, filtered.length - 1);
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      if (!root.current || !list.current) return;
      const box = root.current.getBoundingClientRect();
      const height = Math.min(240, list.current.scrollHeight);
      Object.assign(list.current.style, {
        left: Math.max(8, Math.min(box.left, window.innerWidth - box.width - 8)) + 'px',
        top: (box.bottom + height > window.innerHeight ? Math.max(8, box.top - height) : box.bottom) + 'px',
        width: box.width + 'px'
      });
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open, query, options]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target) && !list.current?.contains(event.target)) {
        setOpen(false);
        setQuery(labelOf(value));
      }
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  });
  useEffect(() => {
    if (open && activeIndex >= 0) list.current?.children[activeIndex]?.scrollIntoView({
      block: 'nearest'
    });
  }, [open, activeIndex]);
  const choose = (event: SyntheticEvent, option: AutocompleteOption | null) => {
    if (disabled) return;
    onChange(event, option);
    setQuery(labelOf(option));
    setOpen(false);
    input.current?.focus();
  };
  return <div className="tbl-combobox" ref={root}>
  <input ref={input} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} className="tbl-input" role="combobox" aria-label={label || placeholder || 'Seleziona opzione'} aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} aria-activedescendant={open && activeIndex >= 0 ? id + '-' + activeIndex : undefined} autoComplete="off" placeholder={placeholder} value={query} onChange={event => {
      setQuery(event.target.value);
      setActive(0);
      setOpen(true);
    }} onFocus={() => {
      setOpen(true);
      setActive(0);
    }} onBlur={event => {
      if (!root.current?.contains(event.relatedTarget)) {
        setOpen(false);
        setQuery(labelOf(value));
      }
    }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        setActive(previous => event.key === 'ArrowDown' ? open ? (previous + 1) % Math.max(1, filtered.length) : 0 : (previous - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
      } else if (event.key === 'Enter' && open) {
        event.preventDefault();
        if (filtered[activeIndex] !== undefined) choose(event, filtered[activeIndex]);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setQuery(labelOf(value));
        onCancel?.();
      } else if (event.key === 'Tab') {
        setOpen(false);
        setQuery(labelOf(value));
      } else if (open && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault();
        setActive(event.key === 'Home' ? 0 : Math.max(0, filtered.length - 1));
      }
    }} />
  <div className="tbl-combobox-controls">
   {!disableClearable && value !== null && <IconButton disabled={disabled} size="small" aria-label="Cancella selezione" onMouseDown={event => event.preventDefault()} onClick={event => choose(event, null)}><Close fontSize="inherit" /></IconButton>}
   <IconButton disabled={disabled} size="small" aria-label={open ? 'Chiudi opzioni' : 'Apri opzioni'} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => {
        input.current?.focus();
        setOpen(!open);
        setQuery('');
        setActive(0);
      }}><KeyboardArrowDown fontSize="inherit" /></IconButton>
  </div>
  {open && !disabled && typeof document !== 'undefined' && createPortal(<ul id={id} ref={list} style={themeVariables(theme)} className="tbl-combobox-list" role="listbox" aria-label={label || 'Opzioni'} onMouseDown={event => event.preventDefault()}>
   {filtered.length ? filtered.map((option, index) => <li id={id + '-' + index} key={index} role="option" aria-selected={value !== null && isOptionEqualToValue(option, value)} data-active={index === activeIndex} onMouseMove={() => setActive(index)} onClick={event => choose(event, option)}>{getOptionLabel(option)}</li>) : <li role="status" style={{
        padding: '.4rem .75rem'
      }}>Nessun risultato</li>}
  </ul>, document.body)}
 </div>;
}
