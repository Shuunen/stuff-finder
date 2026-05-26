type AppTheme = 'dark' | 'light'

export const defaultTheme: AppTheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export type Display = 'card' | 'list'
