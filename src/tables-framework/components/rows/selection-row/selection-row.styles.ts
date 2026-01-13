import { keyframes, styled } from "@mui/material/styles";
import type { IStyleFromProps } from "@/tables-framework/theme/common.types";

interface IBaseTrProps {
  isSelected: boolean;
  isLoading: boolean;
}

const stylesFromProps: IStyleFromProps = {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "isLoading",
};

const blinkAnimation = keyframes`
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.1;
    }
    100% {
        opacity: 1;
    }
`;

const BaseTr = styled(
  "tr",
  stylesFromProps
)<IBaseTrProps>(({ isSelected, isLoading, theme }) => {
  const selectedStyles = {
    outlineStyle: "none" as const,
    outlineColor: theme.palette.secondary.dark,
    outlineWidth: 1,
    backgroundColor: theme.palette.primary.light,
  };
  const loadingStyles = {
    animation: `${blinkAnimation} 1s linear infinite`,
    cursor: "wait",
  };

  return {
    position: "relative",
    cursor: "pointer",
    "& *": {
      cursor: isLoading ? "wait" : undefined,
    },

    ...(isSelected ? selectedStyles : {}),

    ...(isLoading ? loadingStyles : {}),

    ...(!isSelected
      ? {}
      : {
          "&::before": {
            content: '""',
            position: "absolute",
            top: "0.5rem",
            bottom: "0.5rem",
            left: "0.375rem",
            width: "0.25rem",
            borderRadius: "0.125rem",
            backgroundColor: theme.palette.primary.light,
          },
        }),
  };
});

export { BaseTr };
