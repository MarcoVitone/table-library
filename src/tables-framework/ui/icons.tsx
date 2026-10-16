import type { CSSProperties, SVGProps } from "react";
import { useTheme } from "../theme/theme";
import { sxStyle, type SxProps } from "./native-element";
type IconProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  fontSize?: "small" | "medium" | "large" | "inherit";
  color?: string;
  sx?: SxProps;
};
function icon(path: string) {
  return function Icon({
    fontSize = "medium",
    color,
    sx,
    style,
    ...props
  }: IconProps) {
    const {
      palette
    } = useTheme();
    const selected = palette[color as keyof typeof palette];
    const fill = selected && typeof selected === "object" && "main" in selected ? selected.main : color;
    const size = {
      small: "1.25rem",
      medium: "1.5rem",
      large: "2.1875rem",
      inherit: "1em"
    }[fontSize];
    return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props} style={{
      width: size,
      height: size,
      fill: "currentColor",
      flexShrink: 0,
      verticalAlign: "middle",
      color: fill,
      ...sxStyle(sx),
      ...style
    } as CSSProperties}><path d={path} /></svg>;
  };
}
export const ArrowUpward = icon("M12 4 4 12l1.4 1.4 5.6-5.6V21h2V7.8l5.6 5.6L20 12z");
export const ArrowDownward = icon("M11 3v13.2l-5.6-5.6L4 12l8 8 8-8-1.4-1.4-5.6 5.6V3z");
export const KeyboardArrowDown = icon("m7 9 5 5 5-5 1.4 1.4L12 16.8l-6.4-6.4z");
export const ArrowForwardIos = icon("m8 4 8 8-8 8-1.5-1.5L13 12 6.5 5.5z");
export const ArrowBackIosNewOutlined = icon("m16 4 1.5 1.5L11 12l6.5 6.5L16 20l-8-8z");
export const Check = icon("m9 16.2-4.2-4.2L3.4 13.4 9 19l12-12-1.4-1.4z");
export const Close = icon("m6 4.6 6 6 6-6L19.4 6l-6 6 6 6-1.4 1.4-6-6-6 6L4.6 18l6-6-6-6z");
export const Circle = icon("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18");
export const DragIndicator = icon("M8 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4m8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4m8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4m8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4");
export const FilterAlt = icon("M3 4h18l-7 8v7l-4 2v-9z");
export const VisibilityOff = icon("m3 2 19 19-1.4 1.4-4-4A12 12 0 0 1 12 19C6 19 2 12 2 12a20 20 0 0 1 4-4.8L1.6 3.4zm5 7.8a4 4 0 0 0 5.2 5.2zm4-4.8c6 0 10 7 10 7a21 21 0 0 1-3.5 4.4l-3-3A4 4 0 0 0 10.6 8L8.2 5.6A12 12 0 0 1 12 5");
export const ViewColumn = icon("M3 4h5v16H3zm7 0h4v16h-4zm6 0h5v16h-5z");
export const RestartAlt = icon("M12 4a8 8 0 1 1-8 8h2a6 6 0 1 0 6-6v4L6 5l6-5z");
export const Visibility = icon("M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7m0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4");
export const Edit = icon("M3 17.3V21h3.7L18.1 9.6l-3.7-3.7zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7z");
export const Delete = icon("M6 7h12v14H6zm-2-4h5l1-1h4l1 1h5v2H4z");
