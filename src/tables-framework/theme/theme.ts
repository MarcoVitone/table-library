import { createTheme } from "@mui/material/styles";
import "./extended-theme.module";

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#004987",
      dark: "#004987",
      light: "#56BCDB",
    },
    secondary: {
      main: "#56BCDB",
      light: "rgba(86, 188, 219, 0.15)",
    },
    error: {
      main: "#FF0000",
    },
    info: {
      main: "#FFED48",
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
    },
    neutral: {
      main: "#333333",
      light: "#777777",
      ultraLight: "#EFEFEF",
      dark: "#333333",
      border: "#DFE0E1",
      contrastText: "#EFEFEF",
    },
    blue: {
      main: "#002647",
      dark: "#004987",
      light: "rgba(0, 73, 135, 0.30)",
      ultraLight: "rgba(0, 73, 135, 0.10)",
      contrastText: "#ffffff",
    },
    green: {
      main: "#EDF7ED",
      dark: "#EDF7ED",
      light: "#EDF7ED",
      ultraLight: "#EDF7ED",
      contrastText: "#3EA82D",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "initial",
          minWidth: "unset",
        },
        contained: {
          ":hover": {
            backgroundColor: "#002C52",
          },
        },
        outlined: {
          ":hover": {
            backgroundColor: "rgba(0, 73, 135, 0.3)",
          },
        },
        text: {
          ":hover": {
            backgroundColor: "rgba(0, 73, 135, 0.1)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "Noto Sans",
          fontSize: "11px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "166%",
          letterSpacing: "0.4px",
          height: "fit-content",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          color: "rgba(0, 73, 135, 1)",
          "&.MuiChip-outlined": {
            border: "1px solid  rgba(0, 73, 135, 1)",
          },
          "& .MuiChip-deleteIcon": {
            color: "rgba(0, 73, 135, 1)",
          },
        },
        popupIndicator: {
          color: "rgba(0, 73, 135, 1)",
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          height: "1.5rem",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#004987",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#777777",
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "rgba(0, 73, 135, 0.5)",
          },
        },
        track: {
          backgroundColor: "#DFE0E1",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        subtitle1: {
          fontWeight: 700,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          backgroundColor: "rgba(0, 73, 135, 0.10)",
          color: "#004987",
          borderRadius: "0.25rem 0.25rem 0 0",
          marginRight: "0.5rem",

          "&.Mui-selected": {
            backgroundColor: "#56BCDB",
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#004987",
        },
      },
    },
  },
  typography: {
    fontFamily: "Noto Sans",
    button: {
      textTransform: "none",
      fontSize: "14px",
    },
  },
});

export { defaultTheme };
