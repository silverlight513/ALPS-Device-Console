import styled, { css } from "styled-components"

export { Heading } from '../DeviceHistory/styles'

export type ActionTone = 'danger' | 'accent' | 'neutral'

const tones: Record<ActionTone, ReturnType<typeof css>> = {
  danger: css`
    border-color: ${({ theme }) => theme.colors.danger};
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.accentContrast};
  `,
  accent: css`
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentContrast};
  `,
  neutral: css`
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
  `,
}

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const ActionButton = styled.button<{ $tone: ActionTone }>`
  padding: 6px 14px;
  border: 1px solid;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  ${({ $tone }) => tones[$tone]}

  &[aria-disabled='true'] {
    border-color: ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }
`

export const Reason = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
