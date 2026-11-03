import styled from "styled-components"

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
`

export const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`