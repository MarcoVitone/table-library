import { createElement, type CSSProperties, type HTMLAttributes, type ElementType } from "react";
import { domProps, sxStyle, type SxProps } from "@/tables-framework/ui/native-element";
type TFlexBoxGap = string | number;
type TFlexBoxDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
type TFlexBoxJustifyContent = CSSProperties['justifyContent'];
type TFlexBoxAlignItems = CSSProperties['alignItems'];
type FlexStyles = Pick<CSSProperties, 'display' | 'flexDirection' | 'justifyContent' | 'alignItems' | 'gap' | 'padding' | 'margin' | 'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight' | 'flex' | 'flexWrap' | 'position' | 'color' | 'backgroundColor'>;
export type BoxProps = HTMLAttributes<HTMLDivElement> & FlexStyles & {
  direction?: TFlexBoxDirection;
  component?: ElementType;
  sx?: SxProps;
};
const styleKeys = new Set('display flexDirection justifyContent alignItems gap padding margin width height minWidth maxWidth minHeight maxHeight flex flexWrap position color backgroundColor'.split(' '));
export function FlexBox({
  direction = 'row',
  component = 'div',
  sx,
  style,
  ...props
}: BoxProps) {
  const styles = Object.fromEntries(Object.entries(props).filter(([key]) => styleKeys.has(key)));
  return createElement(component, {
    ...domProps(props),
    style: {
      display: 'flex',
      flexDirection: direction,
      ...styles,
      ...sxStyle(sx),
      ...style
    }
  });
}
export type { TFlexBoxGap, TFlexBoxDirection, TFlexBoxJustifyContent, TFlexBoxAlignItems };
