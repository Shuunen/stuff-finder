type AppTheme = 'dark' | 'light'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const defaultTheme: AppTheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export type Display = 'card' | 'list'
