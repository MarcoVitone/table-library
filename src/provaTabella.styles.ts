import {
  Container as MuiContainer,
  Pagination as MuiPagination,
  Stack as MuiStack,
  css,
  styled,
} from "@mui/material";

const Stack = styled(MuiStack)(({ theme }) =>
  css({
    display: "inline-flex",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0,
    borderRadius: " 1.5rem",
    boxShadow: "0  0 1rem 0 rgba(0, 0, 0, 0.08)",
    "& table thead": {
      height: "2.5rem!important",
      padding: "0",
    },
    "& table tbody::-webkit-scrollbar": {
      width: "0.375rem",
    },
    "& table tbody::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.neutral.main + "80",
      borderRadius: "0.1875rem",
    },
    "& table thead, table tbody tr": {
      display: "table",
      width: "100%",
      tableLayout: "fixed",
    },
  })
);

const Container = styled(MuiContainer)(() =>
  css({
    display: "flex",
    width: "100%",
    height: "1.5rem",
    padding: "0.25rem 0 0.25rem 1rem",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  })
);

const PaginationContainer = styled(MuiContainer)(() =>
  css({
    display: "flex",
    width: "100%",
    height: "3rem",
    padding: "0.25rem 0 0.25rem 1rem",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    background: "#FFF",
    borderRadius: " 0 0 1.5rem 1.5rem",
  })
);

const Pagination = styled(MuiPagination)(({ theme }) =>
  css({
    color: theme.palette.neutral.main,
    fontSize: "0.6875rem",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "166%",
    letterSpacing: "0.025rem",
    "& li .MuiButtonBase-root": {
      minWidth: "1.625rem",
      height: "1.625rem",
    },
    "& li .MuiButtonBase-root svg path": {
      fill: theme.palette.primary.main,
    },
  })
);
export { Container, Pagination, PaginationContainer, Stack };
