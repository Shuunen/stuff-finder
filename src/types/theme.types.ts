/* v8 ignore file */
type Theme = 'dark' | 'light'

export const defaultTheme: Theme = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export type Display = 'card' | 'list'

export type Colors = 'pastel-1' | 'pastel-2' | 'pastel-3' | 'pastel-4' | 'pastel-5' | 'pastel-6' | 'primary' | 'white'
