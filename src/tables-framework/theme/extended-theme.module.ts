import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    blue: Palette["primary"];
    neutral: Palette["primary"];
    green: Palette["primary"];
  }

  interface PaletteOptions {
    blue?: PaletteOptions["primary"];
    neutral?: PaletteOptions["primary"];
    green?: PaletteOptions["primary"];
  }

  interface PaletteColor {
    ultraLight?: string;
    border?: string;
  }

  interface SimplePaletteColorOptions {
    ultraLight?: string;
    border?: string;
  }
}
