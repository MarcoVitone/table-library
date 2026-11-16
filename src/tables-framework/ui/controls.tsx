import { createElement, forwardRef, useEffect, useRef, useImperativeHandle as ReactUseImperativeHandle, type ButtonHTMLAttributes, type InputHTMLAttributes, type CSSProperties, type ReactElement, type ReactNode, type ElementType } from "react";
import { useTheme, themeVariables, type Palette } from "../theme/theme";
import { domProps, sxStyle, type SxProps } from "./native-element";
import { Close } from "./icons";
import { useTableLocalization } from "../localization/use-table-localization";
import { useTableAccessibility, type IAccessibilityContext, type TAccessibilitySlot } from "../accessibility";
export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  accessibilitySlot?: TAccessibilitySlot;
  accessibilityContext?: IAccessibilityContext;
  variant?: "text" | "outlined" | "contained";
  color?: keyof Palette | "inherit" | "default";
  size?: "small" | "medium" | "large";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  component?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
  sx?: SxProps;
  status?: string;
  variation?: string;
  disableRipple?: boolean;
  disableElevation?: boolean;
};
export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "text",
  color = "primary",
  size = "medium",
  startIcon,
  endIcon,
  fullWidth,
  component,
  href,
  sx,
  style,
  className,
  children,
  disabled,
  status,
  variation,
  accessibilitySlot = "button",
  accessibilityContext,
  ...rest
}, ref) {
  const theme = useTheme();
  const { getProps } = useTableAccessibility();
  const {
    palette
  } = theme;
  const selected = palette[color as keyof Palette];
  const ink = selected && "main" in Object(selected) ? (selected as {
    main: string;
  }).main : "currentColor";
  const Component = component ?? (href ? "a" : "button");
  const inactive = !!disabled;
  const isLink = Component === "a";
  const onClick = inactive ? (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  } : rest.onClick;
  const accessibilityProps = getProps(accessibilitySlot, { ...domProps(rest), "aria-disabled": rest["aria-disabled"] ?? (inactive || undefined), tabIndex: inactive && isLink ? -1 : rest.tabIndex, onClick,
    children: <>{startIcon && <span className="tbl-button-icon">{startIcon}</span>}{children}{endIcon && <span className="tbl-button-icon">{endIcon}</span>}</>,
  }, accessibilityContext);
  return <Component href={inactive && isLink ? undefined : href} ref={ref} type={rest.type ?? (isLink ? undefined : "button")} disabled={isLink ? undefined : inactive} className={["tbl-button", 'tbl-button-' + variant, 'tbl-size-' + size, variation && 'tbl-button-' + variation, className].filter(Boolean).join(' ')} style={{
    ...themeVariables(theme),
    "--table-button-bg": ink,
    color: ink,
    width: fullWidth ? "100%" : undefined,
    ...sxStyle(sx),
    ...style
  } as CSSProperties} data-disabled={disabled || status === "disabled" ? "true" : undefined} {...accessibilityProps} />;
});
export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function IconButton({
  className,
  ...props
}, ref) {
  return <Button ref={ref} {...props} className={['tbl-icon-button', className].filter(Boolean).join(' ')} />;
});
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'color' | 'onChange'> & {
  accessibilitySlot?: TAccessibilitySlot;
  accessibilityContext?: IAccessibilityContext;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  indeterminate?: boolean;
  size?: 'small' | 'medium';
  color?: string;
  sx?: SxProps;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  inputRef?: React.Ref<HTMLInputElement>;
  slotProps?: {
    input?: InputHTMLAttributes<HTMLInputElement>;
  };
};
export function Checkbox({
  indeterminate = false,
  size = 'medium',
  color = 'primary',
  sx,
  inputProps,
  inputRef,
  slotProps,
  onChange,
  style,
  className,
  accessibilitySlot = "checkbox",
  accessibilityContext,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { getProps } = useTableAccessibility();
  ReactUseImperativeHandle(inputRef, () => ref.current!, []);
  const theme = useTheme();
  const {
    palette
  } = theme;
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const nativeInputProps = {
    ...inputProps,
    ...slotProps?.input
  };
  return <input {...getProps(accessibilitySlot, { ...props, "aria-checked": indeterminate ? 'mixed' as const : props.checked, ...nativeInputProps,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      nativeInputProps.onChange?.(event);
      onChange?.(event, event.target.checked);
    },
  }, accessibilityContext)} ref={ref} type="checkbox" className={['tbl-checkbox', 'tbl-size-' + size, nativeInputProps.className, className].filter(Boolean).join(' ')} style={{
    ...themeVariables(theme),
    accentColor: palette[color as keyof Palette] && "main" in Object(palette[color as keyof Palette]) ? (palette[color as keyof Palette] as {
      main: string;
    }).main : palette.primary.main,
    ...nativeInputProps.style,
    ...sxStyle(sx),
    ...style
  }} />;
}
export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  label?: ReactNode;
  icon?: ReactElement;
  deleteIcon?: ReactElement;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  clickable?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  color?: string;
  component?: ElementType;
  sx?: SxProps;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
}
export function Chip({
  label,
  icon,
  deleteIcon,
  onDelete,
  clickable,
  disabled,
  size = 'medium',
  variant = 'filled',
  color = 'default',
  component = 'span',
  sx,
  backgroundColor,
  textColor,
  iconColor,
  style,
  className,
  ...rest
}: ChipProps) {
  const { getProps } = useTableAccessibility();
  const t = useTableLocalization();
  const {
    palette
  } = useTheme();
  const selected = palette[color as keyof Palette];
  const ink = selected && "main" in Object(selected) ? (selected as {
    main: string;
  }).main : undefined;
  return createElement(component, getProps("chip", {
    ...rest,
    className: ['tbl-chip', 'tbl-chip-' + variant, 'tbl-size-' + size, className].filter(Boolean).join(' '),
    role: clickable ? 'button' : rest.role,
    tabIndex: disabled ? -1 : clickable ? 0 : rest.tabIndex,
    'aria-disabled': disabled || undefined,
    onClick: disabled ? undefined : rest.onClick,
    onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => {
      rest.onKeyDown?.(event);
      if (onDelete && !disabled && (event.key === 'Delete' || event.key === 'Backspace') && event.target === event.currentTarget) {
        event.preventDefault();
        event.currentTarget.querySelector<HTMLButtonElement>('.tbl-chip-delete')?.click();
      }
      if (clickable && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    style: {
      backgroundColor: backgroundColor ?? (variant === 'filled' ? ink : undefined),
      color: textColor ?? (ink && variant === 'filled' ? '#fff' : ink),
      ...sxStyle(sx),
      ...style
    }
  }), icon && <span className="tbl-chip-icon" style={{
    color: iconColor
  }}>{icon}</span>, <span>{label}</span>, onDelete && <button type="button" className="tbl-chip-delete" disabled={disabled} {...getProps("chipDeleteButton", { "aria-label": t("a11y.remove"), onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(event);
  } })}>{deleteIcon ?? <Close fontSize="small" />}</button>);
}
