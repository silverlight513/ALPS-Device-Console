import styled from "styled-components"

import { DevicePolicy } from "@/components/DeviceStatus"

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: calc(
    100dvh - ${({ theme }) => theme.layout.appHeaderHeight} - 2 *
      ${({ theme }) => theme.layout.pageVerticalPadding}
  );
`

// Takes up the spare height, which keeps the pagination at the bottom on short pages.
export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const Heading = styled.h1`
  font-weight: 600;

  &:focus {
    outline: none;
  }
`

export const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
`

export const List = styled.ul`
  container-type: inline-size;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
`

export const Row = styled.li<{ $selected: boolean }>`
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(92px, 1fr) minmax(92px, 1fr) 136px;
  align-items: center;
  gap: 2px 12px;
  min-height: 34px;
  padding: 6px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  ${({ theme, $selected }) =>
    $selected &&
    `
      background: ${theme.colors.background};
      box-shadow: inset 3px 0 0 ${theme.colors.accent};
    `}

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &:last-child {
    border-bottom: 0;
  }

  @container (max-width: 430px) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
`

// The ::after stretches the click area and focus ring over the whole row, which is its positioning parent.
export const SerialButton = styled.button`
  justify-self: start;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.accent};
  font: inherit;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: left;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::after {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: -2px;
  }
`

export const RowPolicy = styled(DevicePolicy)`
  @container (max-width: 430px) {
    grid-column: 1 / -1;
  }
`
