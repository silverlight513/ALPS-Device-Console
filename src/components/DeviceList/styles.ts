import styled from "styled-components"

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

export const TableWrapper = styled.div<{ $dimmed: boolean }>`
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.6 : 1)};
`

// `separate` borders, because a collapsed table doesn't draw the selected row's box-shadow.
export const Table = styled.table`
  width: 100%;
  border-collapse: separate;

  th,
  td {
    padding: 6px 12px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 12.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const NumericCell = styled.td`
  font-variant-numeric: tabular-nums;
`

export const Row = styled.tr<{ $selected: boolean }>`
  position: relative;

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    ${({ theme, $selected }) => $selected && `background: ${theme.colors.background};`}
  }

  td:first-child {
    ${({ theme, $selected }) => $selected && `box-shadow: inset 3px 0 0 ${theme.colors.accent};`}
  }

  &:hover td {
    background: ${({ theme }) => theme.colors.background};
  }

  &:last-child td {
    border-bottom: 0;
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
