import styled from "styled-components"

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  height: ${({ theme }) => theme.layout.appHeaderHeight};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

// Matches PageContainer's width and side padding, so the header lines up with the page content.
export const Inner = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 100%;
  max-width: ${({ theme }) => theme.layout.pageMaxWidth};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.layout.pageGutter};
`

export const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`
