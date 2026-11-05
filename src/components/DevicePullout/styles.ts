import styled from "styled-components"

// The focus outline is off because the panel itself is only focused from code, so screen readers announce it.
export const Panel = styled.aside`
  box-sizing: border-box;
  position: fixed;
  top: ${({ theme }) => theme.layout.appHeaderHeight};
  right: 0;
  bottom: 0;
  z-index: 5;
  width: min(400px, 100vw);
  overflow-y: auto;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: -4px 0 12px rgb(20 28 38 / 8%);

  &:focus {
    outline: none;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: anywhere;

  &:focus {
    outline: none;
  }
`

export const CloseButton = styled.button`
  flex: none;
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
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: 0;
  }
`

export const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
`

export const Warning = styled.p`
  padding: 6px 10px;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.warning};
  background: ${({ theme }) => theme.colors.warningTint};
`
