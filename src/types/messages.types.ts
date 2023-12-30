export type AppMessage = {
  content: string
  delay: number
  type: 'error' | 'info' | 'success' | 'warning'
}

