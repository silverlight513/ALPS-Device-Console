import styled from "styled-components"

export const Container = styled.main`
  box-sizing: border-box;
  max-width: ${({ theme }) => theme.layout.pageMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.layout.pageVerticalPadding} ${theme.layout.pageGutter}`};
`
