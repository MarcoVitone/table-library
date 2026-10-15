import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./native.css";
import { useTheme, themeVariables } from "../theme/theme";
interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  anchor?: HTMLElement | null;
  className?: string;
}
export function NativeDialog({
  open,
  onClose,
  title,
  children,
  anchor,
  className
}: DialogProps) {
  const theme = useTheme();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const position = () => {
      if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      dialog.style.margin = '0';
      dialog.style.left = Math.max(8, Math.min(box.right - dialog.offsetWidth, window.innerWidth - dialog.offsetWidth - 8)) + 'px';
      dialog.style.top = Math.max(8, Math.min(box.bottom + 4, window.innerHeight - dialog.offsetHeight - 8)) + 'px';
    };
    dialog.showModal();
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      dialog.close();
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
      if (previous?.isConnected) previous.focus();
    };
  }, [open, anchor]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(<dialog ref={ref} style={themeVariables(theme)} className={['tbl-dialog', anchor ? 'tbl-popover' : '', className].filter(Boolean).join(' ')} aria-labelledby={titleId} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first) {
      event.preventDefault();
      event.currentTarget.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }} onCancel={event => {
    event.preventDefault();
    onClose();
  }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}><h2 id={titleId} className={anchor ? 'tbl-sr-only' : 'tbl-dialog-title'}>{title}</h2>{children}</dialog>, document.body);
}
