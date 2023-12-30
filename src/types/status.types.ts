export type AppStatus = 'failed' | 'listening' | 'loading' | 'ready' | 'settings-required' | 'unexpected-error'

export const defaultStatus: AppStatus = 'loading'
