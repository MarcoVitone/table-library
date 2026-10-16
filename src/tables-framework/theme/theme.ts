import { createContext, createElement, useContext, type CSSProperties, type ReactNode } from "react";
export interface PaletteColor {
  main: string;
  dark: string;
  light: string;
  contrastText: string;
  ultraLight?: string;
  border?: string;
}
export interface Palette {
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  warning: PaletteColor;
  neutral: PaletteColor;
  blue: PaletteColor;
  green: PaletteColor;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  background: {
    default: string;
    paper: string;
  };
  divider: string;
}
export interface TableTheme {
  palette: Palette;
  typography: {
    fontFamily: string;
    body1: CSSProperties;
    button: CSSProperties;
  };
  spacing: (value: number) => string;
}
type PartialDeep<T> = { [K in keyof T]?: T[K] extends ((...args: never[]) => unknown) ? T[K] : T[K] extends object ? PartialDeep<T[K]> : T[K] };
export type ThemeOptions = PartialDeep<TableTheme>;
const color = (main: string): PaletteColor => ({
  main,
  dark: main,
  light: main,
  contrastText: "#fff"
});
const defaults: TableTheme = {
  palette: {
    primary: color("#004987"),
    secondary: color("#56BCDB"),
    error: color("#d32f2f"),
    info: color("#0288d1"),
    success: color("#2e7d32"),
    warning: color("#ed6c02"),
    neutral: color("#333"),
    blue: color("#004987"),
    green: color("#3ea82d"),
    text: {
      primary: "#222",
      secondary: "#666",
      disabled: "#999"
    },
    background: {
      default: "#fff",
      paper: "#fff"
    },
    divider: "#ddd"
  },
  typography: {
    fontFamily: "'Noto Sans', Arial, sans-serif",
    body1: {
      fontFamily: "inherit"
    },
    button: {
      fontSize: "14px",
      textTransform: "none"
    }
  },
  spacing: value => value * 8 + "px"
};
function merge<T>(base: T, patch?: PartialDeep<T>): T {
  const result = {
    ...base
  };
  for (const key of Object.keys(base as object) as (keyof T)[]) {
    const value = base[key];
    if (value && typeof value === "object" && !Array.isArray(value)) result[key] = merge(value);
  }
  if (!patch) return result;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value !== undefined) result[key] = value && typeof value === "object" && !Array.isArray(value) ? merge(base[key], value as PartialDeep<T[keyof T]>) : value as T[keyof T];
  }
  return result;
}
export function createTheme(options: ThemeOptions = {}): TableTheme {
  const theme = merge(defaults, options);
  theme.typography.body1.fontFamily = options.typography?.body1?.fontFamily ?? theme.typography.fontFamily;
  return theme;
}
export const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#004987",
      dark: "#004987",
      light: "#56BCDB"
    },
    secondary: {
      main: "#56BCDB",
      light: "rgba(86, 188, 219, 0.15)"
    },
    error: {
      main: "#FF0000"
    },
    info: {
      main: "#FFED48"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)"
    },
    neutral: {
      main: "#333333",
      light: "#777777",
      ultraLight: "#EFEFEF",
      dark: "#333333",
      border: "#DFE0E1",
      contrastText: "#EFEFEF"
    },
    blue: {
      main: "#002647",
      dark: "#004987",
      light: "rgba(0, 73, 135, 0.30)",
      ultraLight: "rgba(0, 73, 135, 0.10)",
      contrastText: "#ffffff"
    },
    green: {
      main: "#EDF7ED",
      dark: "#EDF7ED",
      light: "#EDF7ED",
      ultraLight: "#EDF7ED",
      contrastText: "#3EA82D"
    }
  },
  typography: {
    fontFamily: "'Noto Sans', Arial, sans-serif",
    button: {
      textTransform: "none",
      fontSize: "14px"
    }
  }
});
const ThemeContext = createContext(defaultTheme);
export function ThemeProvider({
  theme,
  children
}: {
  theme: ThemeOptions;
  children: ReactNode;
}) {
  const resolved = createTheme(theme);
  return createElement(ThemeContext.Provider, {
    value: resolved
  }, children);
}
export const useTheme = () => useContext(ThemeContext);
export function themeVariables(theme: TableTheme): CSSProperties {
  return {
    "--table-primary": theme.palette.primary.main,
    "--table-surface": theme.palette.background.paper,
    "--table-text": theme.palette.text.primary
  } as CSSProperties;
}
