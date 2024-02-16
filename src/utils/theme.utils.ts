import { createTheme, type ThemeOptions } from '@mui/material/styles'

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#8b32db',
    },
  },
}

export const theme = createTheme(themeOptions)

export function gridClass (columns = 1) {
  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (columns === 2) return 'md:grid-cols-2'
  if (columns === 3) return 'md:grid-cols-3'
  if (columns === 4) return 'md:grid-cols-4'
  if (columns === 5) return 'md:grid-cols-5'
  if (columns === 6) return 'md:grid-cols-6'
  return 'md:grid-cols-1'
  /* eslint-enable @typescript-eslint/no-magic-numbers */
}

export function colSpanClass (columns: number) {
  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (columns === 2) return 'md:col-span-2'
  if (columns === 3) return 'md:col-span-3'
  if (columns === 4) return 'md:col-span-4'
  if (columns === 5) return 'md:col-span-5'
  if (columns === 6) return 'md:col-span-6'
  return 'md:col-span-1'
  /* eslint-enable @typescript-eslint/no-magic-numbers */
}
