import styled from "@emotion/styled";

export const InputContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const InputComponent = styled.input<{ height?: string; width?: string }>`
  width: ${({ width }) => width || "100%"};
  min-width: ${({ width }) => (width ? "auto" : "70px")};
  height: ${({ height }) => height || "28px"};
  padding: 0 0.5rem; /* Horizontal padding only, let height center vertical */
  font-size: 0.8125rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: transparent;
  color: inherit;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  line-height: normal; /* Let height control alignment */

  &:focus {
    border-color: #1976d2;
    box-shadow: 0 0 0 1px #1976d2;
  }
`;
