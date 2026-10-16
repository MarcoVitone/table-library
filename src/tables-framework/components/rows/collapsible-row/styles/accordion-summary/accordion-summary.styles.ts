import { createElement, type HTMLAttributes, type ReactNode } from "react";
import { nativeElement } from "@/tables-framework/ui/native-element";
export function CustomAccordionSummary({
  expandIcon,
  children,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & {
  expandIcon?: ReactNode;
}) {
  return createElement('summary', {
    ...props,
    className: ['tbl-accordion-summary', props.className].filter(Boolean).join(' '),
    style: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      ...style
    }
  }, children, createElement('span', {
    className: 'tbl-accordion-arrow'
  }, expandIcon));
}
export const CustomBar = nativeElement('div', 'tbl-accordion-bar', ({
  theme
}) => ({
  width: '.2rem',
  backgroundColor: theme.palette.secondary.main,
  marginRight: '.5rem'
}));
