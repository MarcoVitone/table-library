import { nativeElement } from "@/tables-framework/ui/native-element";
import type { TAlignment, TtextTransform, IBorderConfig } from "@/tables-framework/defines/common.types";
interface IBaseCellProps {
  noLeft?: boolean;
  noRight?: boolean;
  noTop?: boolean;
  noBorder?: boolean;
  borderColor?: string;
  bold?: boolean;
  textPosition?: TAlignment;
  textTransform?: TtextTransform;
  fontColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  padding?: string;
  overFlow?: string;
  textOverflow?: string;
  isSorted?: boolean;
  backgroundColorSort?: string;
  isSortActive?: boolean;
  isSticky?: boolean;
  isFirstRow?: boolean;
  fixed?: boolean;
  isSelected?: boolean;
  rowSelectedColor?: string;
  wrapText?: boolean;
  ellipsis?: boolean;
  maxWidth?: string | number;
  borderRight?: IBorderConfig;
  borderBottom?: IBorderConfig;
  borderTop?: IBorderConfig;
  borderLeft?: IBorderConfig;
  stickyLeft?: string;
  isDragging?: boolean;
  draggable?: boolean;
}
const border = (config: IBorderConfig | undefined, fallback: string) => config?.show ? [config.width || '1px', config.style || 'solid', config.color || fallback].join(' ') : 'none';
export const BaseCellComponent = nativeElement<'td', IBaseCellProps>('td', 'tbl-cell', p => ({
  borderLeft: border(p.borderLeft, p.borderColor || p.theme.palette.neutral.border || '#ddd'),
  borderTop: border(p.borderTop, p.borderColor || '#ddd'),
  borderRight: border(p.borderRight, p.borderColor || '#ddd'),
  borderBottom: border(p.borderBottom, p.borderColor || '#ddd'),
  padding: p.padding || '.5rem .75rem',
  color: p.fontColor || p.theme.palette.primary.dark,
  backgroundColor: p.isSelected ? p.rowSelectedColor || 'rgba(0,73,135,.1)' : p.isSorted ? p.backgroundColorSort : p.backgroundColor || (p.fixed ? '#fff' : 'transparent'),
  fontWeight: p.bold ? 'bold' : 'normal',
  textAlign: p.textPosition || 'left',
  textTransform: p.textTransform,
  fontSize: p.fontSize || '1rem',
  fontFamily: p.theme.typography.body1.fontFamily,
  whiteSpace: p.ellipsis ? 'nowrap' : p.wrapText ? 'normal' : 'nowrap',
  maxWidth: p.maxWidth,
  overflow: p.ellipsis ? 'hidden' : p.overFlow,
  textOverflow: p.ellipsis ? 'ellipsis' : p.textOverflow,
  position: p.isSticky || p.fixed ? 'sticky' : 'relative',
  top: p.isSticky ? 0 : undefined,
  left: p.fixed ? p.stickyLeft || 0 : undefined,
  zIndex: p.fixed && p.isSticky ? 40 : p.fixed ? 30 : p.isSticky ? 10 : undefined,
  opacity: p.isDragging ? .5 : 1
}));
