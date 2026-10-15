import { createElement, forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementType } from "react";
import { useTheme, themeVariables, type TableTheme } from "../theme/theme";
import "./native.css";
export type SxProps = CSSProperties & Partial<Record<"m" | "mx" | "my" | "mt" | "mb" | "ml" | "mr" | "p" | "px" | "py" | "pt" | "pb" | "pl" | "pr" | "bgcolor", string | number>>;
export function sxStyle(sx?: SxProps): CSSProperties {
  if (!sx) return {};
  const result: Record<string, string | number | undefined> = {};
  const aliases: Record<string, string[]> = {
    m: ["margin"],
    mx: ["marginLeft", "marginRight"],
    my: ["marginTop", "marginBottom"],
    mt: ["marginTop"],
    mb: ["marginBottom"],
    ml: ["marginLeft"],
    mr: ["marginRight"],
    p: ["padding"],
    px: ["paddingLeft", "paddingRight"],
    py: ["paddingTop", "paddingBottom"],
    pt: ["paddingTop"],
    pb: ["paddingBottom"],
    pl: ["paddingLeft"],
    pr: ["paddingRight"],
    bgcolor: ["backgroundColor"]
  };
  for (const [key, value] of Object.entries(sx)) {
    for (const property of aliases[key] ?? [key]) result[property] = aliases[key] && key !== "bgcolor" && typeof value === "number" ? value * 8 : value;
  }
  return result as CSSProperties;
}
const attributes = new Set("id title role className style children tabIndex hidden dir lang name value defaultValue type disabled checked defaultChecked multiple required readOnly placeholder autoFocus autoComplete autoCapitalize spellCheck min max step pattern minLength maxLength size rows cols htmlFor form href target rel download colSpan rowSpan scope headers draggable contentEditable suppressContentEditableWarning suppressHydrationWarning onToggle open controls src alt loading width height method action noValidate inputMode list accept enterKeyHint wrap capture".split(" "));
export function domProps(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([key]) => (attributes.has(key) || /^(aria-|data-|on[A-Z])/.test(key)) && !/^on(Cell|Action|Prompt|End|Sort|Header|Hide|Row|Data|Layout|Page|Pagination)/.test(key)));
}
export function nativeElement<T extends keyof HTMLElementTagNameMap, P extends object = object>(tag: T, className: string, styles?: (props: P & {
  theme: TableTheme;
}) => CSSProperties) {
  type Props = Omit<ComponentPropsWithoutRef<T>, keyof P> & P & {
    component?: ElementType;
    as?: ElementType;
    sx?: SxProps;
  };
  const Element = forwardRef<HTMLElementTagNameMap[T], Props>((props, ref) => {
    const theme = useTheme();
    const {
      component,
      as,
      sx,
      style,
      className: customClass,
      ...rest
    } = props as Props & {
      style?: CSSProperties;
      className?: string;
    };
    // React createElement forwards this ref; it does not read ref.current.
    // eslint-disable-next-line react-hooks/refs
    return createElement(component ?? as ?? tag, {
      ...domProps(rest),
      ref,
      "data-loading": (rest as Record<string, unknown>).isLoading || undefined,
      "data-configured": (rest as Record<string, unknown>).isConfigured || undefined,
      "data-selected": (rest as Record<string, unknown>).isSelected || undefined,
      "data-sort-active": (rest as Record<string, unknown>).isSortActive || undefined,
      className: [className, customClass].filter(Boolean).join(" "),
      style: {
        ...themeVariables(theme),
        ...styles?.({
          ...props,
          theme
        } as P & {
          theme: TableTheme;
        }),
        ...sxStyle(sx),
        ...style
      }
    });
  });
  Element.displayName = 'Native(' + tag + ')';
  return Element;
}
