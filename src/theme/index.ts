export const theme = {
  layout: {
    appHeaderHeight: '56px',
    pageMaxWidth: '1200px',
    pageGutter: '24px',
    pageVerticalPadding: '24px',
  },
  // "Cold Steel"
  colors: {
    background: '#F3F5F8',
    surface: '#FFFFFF',
    border: '#D6DCE4',
    textPrimary: '#141C26',
    textSecondary: '#4A5766',
    textDisabled: '#8A96A3',
    accent: '#2A5D8F',
    accentContrast: '#FFFFFF',
    success: '#1B7340',
    successTint: '#DFEBE4',
    warning: '#855700',
    warningTint: '#EEE7DB',
    danger: '#B3261E',
    dangerTint: '#F4E1E0',
  },
} as const

export type AppTheme = typeof theme
