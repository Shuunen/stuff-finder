interface AppSettings extends Record<string, unknown>{
  base: string
  key: string
  table: string
  view: string
}