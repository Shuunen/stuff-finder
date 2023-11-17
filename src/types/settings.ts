export interface AppCredentials extends Record<string, unknown> {
  base: string
  key: string
  table: string
  view: string
  wrap: string
}
