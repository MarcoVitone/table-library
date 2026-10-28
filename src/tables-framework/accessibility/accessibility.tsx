import { createElement, forwardRef, useContext, useMemo, type HTMLAttributes, type ReactNode, type ComponentPropsWithoutRef, type Ref, type ReactElement } from "react";
import { AccessibilityContext, ElementContext, useTableAccessibility, type IAccessibilityContext, type ITableAccessibility, type TAccessibilitySlot } from "./accessibility-config";

export function AccessibilityScope({ context, children }: { context: IAccessibilityContext; children: ReactNode }) {
  const inherited = useContext(ElementContext);
  const value = useMemo(() => ({ ...inherited, ...context }), [inherited, context]);
  return <ElementContext.Provider value={value}>{children}</ElementContext.Provider>;
}

export function AccessibilityProvider({ value, children }: { value?: ITableAccessibility; children: ReactNode }) {
  const inherited = useContext(AccessibilityContext);
  const config = useMemo(() => value ? {
    ...inherited, ...value,
    dialog: { ...inherited?.dialog, ...value.dialog },
    slotProps: { ...inherited?.slotProps, ...value.slotProps },
    messages: { ...inherited?.messages, ...value.messages },
  } : inherited, [inherited, value]);
  return <AccessibilityContext.Provider value={config}>{children}</AccessibilityContext.Provider>;
}

/** Internal native element adapter; portals retain the provider's configuration. */
type ElementProps = HTMLAttributes<HTMLElement> & {
  as: keyof HTMLElementTagNameMap;
  slot: TAccessibilitySlot;
  context?: IAccessibilityContext;
};
export const AccessibilityElement = forwardRef<HTMLElement, ElementProps>(function AccessibilityElement({ as, slot, context, ...props }, ref) {
  const { getProps } = useTableAccessibility();
  const nativeProps = getProps(slot, props, context);
  // `as` is always a native tag: createElement forwards the ref without reading it.
  // eslint-disable-next-line react-hooks/refs -- The dynamic native tag is incorrectly treated as a function that might read refs.
  return createElement(as, { ...nativeProps, ref });
}) as <T extends keyof HTMLElementTagNameMap>(props: Omit<ComponentPropsWithoutRef<T>, "slot"> & { as: T; slot: TAccessibilitySlot; context?: IAccessibilityContext; ref?: Ref<HTMLElementTagNameMap[T]> }) => ReactElement;
