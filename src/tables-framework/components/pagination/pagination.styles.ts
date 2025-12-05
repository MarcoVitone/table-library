import styled from "@emotion/styled";

type TPaginationAlignment = "left" | "center" | "right";

interface IPaginationContainerProps {
  alignment: TPaginationAlignment;
}

const getJustifyContent = (alignment: TPaginationAlignment): string => {
  switch (alignment) {
    case "left":
      return "flex-start";
    case "center":
      return "center";
    case "right":
    default:
      return "flex-end";
  }
};

const PaginationContainer = styled.div<IPaginationContainerProps>`
  display: flex;
  align-items: center;
  justify-content: ${({ alignment }) => getJustifyContent(alignment)};
  padding: 12px 16px;
  gap: 16px;
  font-family: inherit;
  font-size: 14px;
  color: #333;
`;

const PaginationInfo = styled.span`
  color: #666;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${({ disabled }) => (disabled ? "#f5f5f5" : "#fff")};
  color: ${({ disabled }) => (disabled ? "#aaa" : "#333")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
  }

  &:active:not(:disabled) {
    background: #e0e0e0;
  }
`;

const PageSizeSelect = styled.select`
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: #ccc;
  }

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid ${({ isActive }) => (isActive ? "#1976d2" : "#ddd")};
  border-radius: 4px;
  background: ${({ isActive }) => (isActive ? "#1976d2" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#333")};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: ${({ isActive }) => (isActive ? "#1565c0" : "#f0f0f0")};
    border-color: ${({ isActive }) => (isActive ? "#1565c0" : "#ccc")};
  }
`;

// Phase 2: GoToPage styles
const GoToPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GoToPageInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  text-align: center;

  &:hover {
    border-color: #ccc;
  }

  &:focus {
    outline: none;
    border-color: #1976d2;
  }

  /* Remove spinner buttons */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const GoToPageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #1976d2;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1565c0;
    border-color: #1565c0;
  }

  &:active {
    background: #0d47a1;
  }
`;

export {
  PaginationContainer,
  PaginationInfo,
  PaginationControls,
  PaginationButton,
  PageSizeSelect,
  PageNumbers,
  PageButton,
  GoToPageContainer,
  GoToPageInput,
  GoToPageButton,
};
