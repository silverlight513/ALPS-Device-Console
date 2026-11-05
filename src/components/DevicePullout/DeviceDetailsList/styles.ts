import styled from "styled-components"

export const List = styled.dl`
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 6px 12px;
  margin: 0;
`

export const Label = styled.dt`
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Value = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: anywhere;
`
