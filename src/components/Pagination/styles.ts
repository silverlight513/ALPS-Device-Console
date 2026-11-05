import styled from "styled-components"

export const Nav = styled.nav<{ $dimmed: boolean }>`
  opacity: ${({ $dimmed }) => ($dimmed ? 0.6 : 1)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
`

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

// NOTE: A Button like this is obviously a good candidate for a component library and normally, even for a small project since it takes no extra time, I would have set it up in one but it was explicitely restricted from the requirements.
export const Button = styled.button`
  padding: 4px 11px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }
`

export const Summary = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
