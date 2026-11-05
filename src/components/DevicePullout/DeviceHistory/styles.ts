import styled from "styled-components"

export const Heading = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
  }
`

export const List = styled.ul<{ $dimmed: boolean }>`
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.6 : 1)};
`

export const Entry = styled.li`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: anywhere;

  &:last-child {
    border-bottom: 0;
  }
`

export const EntryHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2px 12px;
`

export const EventType = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.03em;
`

export const Meta = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
