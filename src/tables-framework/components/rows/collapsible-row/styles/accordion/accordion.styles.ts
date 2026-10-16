import { createElement, type HTMLAttributes, type SyntheticEvent } from "react";
import { useTheme } from "@/tables-framework/theme/theme";
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDetailsElement>, 'onChange'> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (event: SyntheticEvent, expanded: boolean) => void;
  isNewRow?: boolean;
  isSalesManager?: boolean;
}
export function CustomAccordion({
  expanded,
  defaultExpanded,
  onChange,
  isNewRow,
  isSalesManager,
  children,
  style,
  ...props
}: AccordionProps) {
  const {
    palette
  } = useTheme();
  return createElement('details', {
    ...props,
    open: expanded ?? defaultExpanded,
    className: ['tbl-accordion', props.className].filter(Boolean).join(' '),
    style: {
      width: 'inherit',
      borderRadius: 0,
      backgroundColor: isNewRow ? palette.primary.main : isSalesManager ? '#fdf0e5' : '#fff',
      ...style
    },
    onToggle: (event: React.ToggleEvent<HTMLDetailsElement>) => {
      props.onToggle?.(event);
      if (expanded === undefined || event.currentTarget.open !== expanded) onChange?.(event, event.currentTarget.open);
    }
  }, children);
}
