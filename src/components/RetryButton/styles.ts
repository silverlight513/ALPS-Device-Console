import styled from "styled-components"

export const Button = styled.button`
  align-self: flex-start;
  padding: 4px 11px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &[aria-disabled='true'] {
    opacity: 0.6;
    cursor: default;
  }
`
