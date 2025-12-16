import { css, styled } from "@mui/material/styles";

export const ResizerHandle = styled("div")(({ theme }) =>
  css({
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: "4px", // Area cliccabile
    cursor: "col-resize",
    userSelect: "none",
    touchAction: "none",
    zIndex: 100, // Sopra il contenuto
    transition: "background-color 0.2s",

    // Linea visibile solo al passaggio o mentre si trascina
    "&:hover, &:active": {
      backgroundColor: theme.palette.primary.main,
    },
    // Opzionale: sempre visibile come linea sottile
    borderRight: `1px solid ${theme.palette.divider}`,
    opacity: 0.5,
  })
);
