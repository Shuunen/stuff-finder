type AppTheme = 'dark' | 'light'

export const defaultTheme: AppTheme = typeof window !== 'undefined' && /* c8 ignore next */ window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export type Display = 'card' | 'list'
